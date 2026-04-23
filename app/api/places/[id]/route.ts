import { NextRequest } from 'next/server';
import { Prisma } from '@prisma/client';
import { deletePlace, getPlace, PlaceHierarchyError, updatePlace } from '@/server/place-service';
import { conflictError, internalServerError, notFoundError, successResponse, validationError } from '@/server/response';
import { placeIdSchema } from '@/schemas/place';
import { ZodError } from 'zod';

type RouteContext = {
  params: Promise<{ id: string }>;
};

function validatePlaceId(id: string) {
  return placeIdSchema.safeParse({ id });
}

export async function GET(_: NextRequest, context: RouteContext) {
  const { id } = await context.params;

  if (!validatePlaceId(id).success) {
    return validationError('Invalid place id', { id: 'Must be a valid UUID' });
  }

  try {
    const place = await getPlace(id);

    if (!place) {
      return notFoundError('Place not found');
    }

    return successResponse(place);
  } catch {
    return internalServerError('Failed to get place');
  }
}

export async function PATCH(request: NextRequest, context: RouteContext) {
  const { id } = await context.params;

  if (!validatePlaceId(id).success) {
    return validationError('Invalid place id', { id: 'Must be a valid UUID' });
  }

  const body = await request.json().catch(() => null);

  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    return validationError('Invalid place payload', { body: 'Expected a JSON object body' });
  }

  try {
    const updated = await updatePlace(id, body);
    if (!updated) {
      return notFoundError('Place not found');
    }

    return successResponse(updated);
  } catch (error) {
    if (error instanceof ZodError) {
      return validationError('Invalid place payload', error.issues);
    }

    if (error instanceof PlaceHierarchyError) {
      return validationError(error.message, { parentPlaceId: error.message });
    }

    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
      return conflictError('Place slug must be unique');
    }

    return internalServerError('Failed to update place');
  }
}

export async function DELETE(_: NextRequest, context: RouteContext) {
  const { id } = await context.params;

  if (!validatePlaceId(id).success) {
    return validationError('Invalid place id', { id: 'Must be a valid UUID' });
  }

  try {
    const deleted = await deletePlace(id);

    if (!deleted) {
      return notFoundError('Place not found');
    }

    return successResponse(deleted);
  } catch {
    return internalServerError('Failed to delete place');
  }
}
