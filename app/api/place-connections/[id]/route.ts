import { NextRequest } from 'next/server';
import { deletePlaceConnection } from '@/server/place-connection-service';
import { internalServerError, notFoundError, successResponse, validationError } from '@/server/response';
import { placeConnectionIdSchema } from '@/schemas/place-connection';

type RouteContext = { params: Promise<{ id: string }> };

export async function DELETE(_: NextRequest, context: RouteContext) {
  const { id } = await context.params;
  if (!placeConnectionIdSchema.safeParse({ id }).success) return validationError('Invalid id', { id: 'Must be a valid UUID' });

  try {
    const deleted = await deletePlaceConnection(id);
    if (!deleted) return notFoundError('Place connection not found');
    return successResponse(deleted);
  } catch {
    return internalServerError('Failed to delete place connection');
  }
}
