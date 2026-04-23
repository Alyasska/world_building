import { NextRequest } from 'next/server';
import { Prisma } from '@prisma/client';
import { createFaction, listFactions } from '@/server/faction-service';
import { conflictError, internalServerError, successResponse, validationError } from '@/server/response';
import { ZodError } from 'zod';

export async function GET() {
  try {
    const factions = await listFactions();
    return successResponse(factions);
  } catch {
    return internalServerError('Failed to list factions');
  }
}

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);

  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    return validationError('Invalid faction payload', { body: 'Expected a JSON object body' });
  }

  try {
    const faction = await createFaction(body);
    return successResponse(faction, 201);
  } catch (error) {
    if (error instanceof ZodError) {
      return validationError('Invalid faction payload', error.issues);
    }

    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
      return conflictError('Faction slug must be unique');
    }

    return internalServerError('Failed to create faction');
  }
}
