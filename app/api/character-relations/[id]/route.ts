import { NextRequest } from 'next/server';
import { deleteCharacterRelation } from '@/server/character-relation-service';
import { internalServerError, notFoundError, successResponse, validationError } from '@/server/response';
import { characterRelationIdSchema } from '@/schemas/character-relation';

type RouteContext = { params: Promise<{ id: string }> };

export async function DELETE(_: NextRequest, context: RouteContext) {
  const { id } = await context.params;
  if (!characterRelationIdSchema.safeParse({ id }).success) return validationError('Invalid id', { id: 'Must be a valid UUID' });

  try {
    const deleted = await deleteCharacterRelation(id);
    if (!deleted) return notFoundError('Character relation not found');
    return successResponse(deleted);
  } catch {
    return internalServerError('Failed to delete character relation');
  }
}
