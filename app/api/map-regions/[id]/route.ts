import { NextRequest } from 'next/server';
import { Prisma } from '@prisma/client';
import { ZodError } from 'zod';
import { deleteMapRegion, getMapRegion, MapRegionValidationError, updateMapRegion } from '@/server/map-region-service';
import { conflictError, internalServerError, notFoundError, successResponse, validationError } from '@/server/response';
import { mapRegionIdSchema } from '@/schemas/map-region';

type RouteContext = {
  params: Promise<{ id: string }>;
};

function validateRegionId(id: string) {
  return mapRegionIdSchema.safeParse({ id });
}

export async function GET(_: NextRequest, context: RouteContext) {
  const { id } = await context.params;

  if (!validateRegionId(id).success) {
    return validationError('Invalid region id', { id: 'Must be a valid UUID' });
  }

  try {
    const region = await getMapRegion(id);
    if (!region) return notFoundError('Region not found');
    return successResponse(region);
  } catch {
    return internalServerError('Failed to get region');
  }
}

export async function PATCH(request: NextRequest, context: RouteContext) {
  const { id } = await context.params;

  if (!validateRegionId(id).success) {
    return validationError('Invalid region id', { id: 'Must be a valid UUID' });
  }

  const body = await request.json().catch(() => null);

  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    return validationError('Invalid region payload', { body: 'Expected a JSON object body' });
  }

  try {
    const updated = await updateMapRegion(id, body);
    if (!updated) return notFoundError('Region not found');
    return successResponse(updated);
  } catch (error) {
    if (error instanceof ZodError) return validationError('Invalid region payload', error.issues);
    if (error instanceof MapRegionValidationError) {
      return validationError(error.message, {});
    }
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
      return conflictError('Region slug must be unique');
    }
    return internalServerError('Failed to update region');
  }
}

export async function DELETE(_: NextRequest, context: RouteContext) {
  const { id } = await context.params;

  if (!validateRegionId(id).success) {
    return validationError('Invalid region id', { id: 'Must be a valid UUID' });
  }

  try {
    const deleted = await deleteMapRegion(id);
    if (!deleted) return notFoundError('Region not found');
    return successResponse(deleted);
  } catch {
    return internalServerError('Failed to delete region');
  }
}
