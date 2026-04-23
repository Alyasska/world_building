import { NextRequest } from 'next/server';
import { deleteStoryEntity } from '@/server/story-entity-service';
import { internalServerError, notFoundError, successResponse, validationError } from '@/server/response';
import { storyEntityIdSchema } from '@/schemas/story-entity';

type RouteContext = { params: Promise<{ id: string }> };

export async function DELETE(_: NextRequest, context: RouteContext) {
  const { id } = await context.params;
  if (!storyEntityIdSchema.safeParse({ id }).success) return validationError('Invalid id', { id: 'Must be a valid UUID' });

  try {
    const deleted = await deleteStoryEntity(id);
    if (!deleted) return notFoundError('Story entity not found');
    return successResponse(deleted);
  } catch {
    return internalServerError('Failed to delete story entity');
  }
}
