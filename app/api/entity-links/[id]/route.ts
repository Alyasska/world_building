import { NextRequest } from 'next/server';
import { deleteEntityLink } from '@/server/entity-link-service';
import { internalServerError, notFoundError, successResponse, validationError } from '@/server/response';
import { entityLinkDeleteSchema } from '@/schemas/link';

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function DELETE(_: NextRequest, context: RouteContext) {
  const { id } = await context.params;

  if (!entityLinkDeleteSchema.safeParse({ id }).success) {
    return validationError('Invalid entity link id', { id: 'Must be a valid UUID' });
  }

  try {
    const deleted = await deleteEntityLink(id);

    if (!deleted) return notFoundError('Entity link not found');

    return successResponse(deleted);
  } catch {
    return internalServerError('Failed to delete entity link');
  }
}
