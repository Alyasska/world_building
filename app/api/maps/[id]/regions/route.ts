import { NextRequest } from 'next/server';
import { Prisma } from '@prisma/client';
import { ZodError } from 'zod';
import { createMapRegion, listMapRegions, MapRegionValidationError } from '@/server/map-region-service';
import { conflictError, internalServerError, notFoundError, successResponse, validationError } from '@/server/response';
import { mapIdSchema } from '@/schemas/map';

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function GET(_: NextRequest, context: RouteContext) {
  const { id } = await context.params;

  if (!mapIdSchema.safeParse({ id }).success) {
    return validationError('Invalid map id', { id: 'Must be a valid UUID' });
  }

  try {
    return successResponse(await listMapRegions(id));
  } catch {
    return internalServerError('Failed to list regions');
  }
}

export async function POST(request: NextRequest, context: RouteContext) {
  const { id } = await context.params;

  if (!mapIdSchema.safeParse({ id }).success) {
    return validationError('Invalid map id', { id: 'Must be a valid UUID' });
  }

  const body = await request.json().catch(() => null);

  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    return validationError('Invalid region payload', { body: 'Expected a JSON object body' });
  }

  try {
    return successResponse(await createMapRegion(id, body), 201);
  } catch (error) {
    if (error instanceof ZodError) return validationError('Invalid region payload', error.issues);
    if (error instanceof MapRegionValidationError) {
      if (error.message === 'Map not found') return notFoundError('Map not found');
      return validationError(error.message, {});
    }
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
      return conflictError('Region slug must be unique');
    }
    return internalServerError('Failed to create region');
  }
}
