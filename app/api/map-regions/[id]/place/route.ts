import { NextRequest } from 'next/server';
import { ZodError } from 'zod';
import { bindRegionToPlace, getMapRegion, MapRegionValidationError, unbindRegionFromPlace } from '@/server/map-region-service';
import { internalServerError, notFoundError, successResponse, validationError } from '@/server/response';
import { mapRegionIdSchema } from '@/schemas/map-region';

type RouteContext = {
  params: Promise<{ id: string }>;
};

function validateRegionId(id: string) {
  return mapRegionIdSchema.safeParse({ id });
}

// Returns the current place bound to this region, or null if unbound.
export async function GET(_: NextRequest, context: RouteContext) {
  const { id } = await context.params;

  if (!validateRegionId(id).success) {
    return validationError('Invalid region id', { id: 'Must be a valid UUID' });
  }

  try {
    const region = await getMapRegion(id);
    if (!region) return notFoundError('Region not found');
    return successResponse(region.place);
  } catch {
    return internalServerError('Failed to get region place');
  }
}

// Bind this region to a place. Body: { placeId: string (UUID) }
export async function PUT(request: NextRequest, context: RouteContext) {
  const { id } = await context.params;

  if (!validateRegionId(id).success) {
    return validationError('Invalid region id', { id: 'Must be a valid UUID' });
  }

  const body = await request.json().catch(() => null);

  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    return validationError('Invalid payload', { body: 'Expected a JSON object body' });
  }

  try {
    const updated = await bindRegionToPlace(id, body);
    if (!updated) return notFoundError('Region not found');
    return successResponse(updated);
  } catch (error) {
    if (error instanceof ZodError) return validationError('Invalid payload', error.issues);
    if (error instanceof MapRegionValidationError) {
      return validationError(error.message, {});
    }
    return internalServerError('Failed to bind region to place');
  }
}

// Remove the place binding from this region.
export async function DELETE(_: NextRequest, context: RouteContext) {
  const { id } = await context.params;

  if (!validateRegionId(id).success) {
    return validationError('Invalid region id', { id: 'Must be a valid UUID' });
  }

  try {
    const updated = await unbindRegionFromPlace(id);
    if (!updated) return notFoundError('Region not found');
    return successResponse(updated);
  } catch {
    return internalServerError('Failed to unbind region from place');
  }
}
