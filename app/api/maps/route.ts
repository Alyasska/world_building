import { NextRequest } from 'next/server';
import { Prisma } from '@prisma/client';
import { ZodError } from 'zod';
import { createMap, listMaps } from '@/server/map-service';
import { conflictError, internalServerError, successResponse, validationError } from '@/server/response';

export async function GET() {
  try {
    return successResponse(await listMaps());
  } catch {
    return internalServerError('Failed to list maps');
  }
}

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);

  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    return validationError('Invalid map payload', { body: 'Expected a JSON object body' });
  }

  try {
    return successResponse(await createMap(body), 201);
  } catch (error) {
    if (error instanceof ZodError) return validationError('Invalid map payload', error.issues);
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
      return conflictError('Map slug must be unique');
    }
    return internalServerError('Failed to create map');
  }
}
