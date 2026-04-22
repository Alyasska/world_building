import { NextRequest } from 'next/server';
import { deleteEntityTag } from '@/server/entity-tag-service';
import { internalServerError, notFoundError, successResponse, validationError } from '@/server/response';
import { entityTagDeleteSchema } from '@/schemas/link';

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function DELETE(_: NextRequest, context: RouteContext) {
  const { id } = await context.params;

  if (!entityTagDeleteSchema.safeParse({ id }).success) {
    return validationError('Invalid entity tag id', { id: 'Must be a valid UUID' });
  }

  try {
    const deleted = await deleteEntityTag(id);

    if (!deleted) return notFoundError('Entity tag not found');

    return successResponse(deleted);
  } catch {
    return internalServerError('Failed to delete entity tag');
  }
}
