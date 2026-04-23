import { NextRequest } from 'next/server';
import { Prisma } from '@prisma/client';
import { createLoreEntry, listLoreEntries } from '@/server/lore-entry-service';
import { conflictError, internalServerError, successResponse, validationError } from '@/server/response';
import { ZodError } from 'zod';

export async function GET() {
  try {
    return successResponse(await listLoreEntries());
  } catch {
    return internalServerError('Failed to list lore entries');
  }
}

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    return validationError('Invalid lore entry payload', { body: 'Expected a JSON object body' });
  }

  try {
    return successResponse(await createLoreEntry(body), 201);
  } catch (error) {
    if (error instanceof ZodError) return validationError('Invalid lore entry payload', error.issues);
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') return conflictError('Lore entry slug must be unique');
    return internalServerError('Failed to create lore entry');
  }
}
