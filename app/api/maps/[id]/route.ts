import { NextRequest } from 'next/server';
import { Prisma } from '@prisma/client';
import { ZodError } from 'zod';
import { deleteMap, getMap, updateMap } from '@/server/map-service';
import { conflictError, internalServerError, notFoundError, successResponse, validationError } from '@/server/response';
import { mapIdSchema } from '@/schemas/map';

type RouteContext = {
  params: Promise<{ id: string }>;
};

function validateMapId(id: string) {
  return mapIdSchema.safeParse({ id });
}

export async function GET(_: NextRequest, context: RouteContext) {
  const { id } = await context.params;

  if (!validateMapId(id).success) {
    return validationError('Invalid map id', { id: 'Must be a valid UUID' });
  }

  try {
    const map = await getMap(id);
    if (!map) return notFoundError('Map not found');
    return successResponse(map);
  } catch {
    return internalServerError('Failed to get map');
  }
}

export async function PATCH(request: NextRequest, context: RouteContext) {
  const { id } = await context.params;

  if (!validateMapId(id).success) {
    return validationError('Invalid map id', { id: 'Must be a valid UUID' });
  }

  const body = await request.json().catch(() => null);

  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    return validationError('Invalid map payload', { body: 'Expected a JSON object body' });
  }

  try {
    const updated = await updateMap(id, body);
    if (!updated) return notFoundError('Map not found');
    return successResponse(updated);
  } catch (error) {
    if (error instanceof ZodError) return validationError('Invalid map payload', error.issues);
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
      return conflictError('Map slug must be unique');
    }
    return internalServerError('Failed to update map');
  }
}

export async function DELETE(_: NextRequest, context: RouteContext) {
  const { id } = await context.params;

  if (!validateMapId(id).success) {
    return validationError('Invalid map id', { id: 'Must be a valid UUID' });
  }

  try {
    const deleted = await deleteMap(id);
    if (!deleted) return notFoundError('Map not found');
    return successResponse(deleted);
  } catch {
    return internalServerError('Failed to delete map');
  }
}
