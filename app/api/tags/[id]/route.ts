import { NextRequest } from 'next/server';
import { Prisma } from '@prisma/client';
import { deleteTag, updateTag } from '@/server/tag-service';
import { conflictError, internalServerError, notFoundError, successResponse, validationError } from '@/server/response';
import { tagIdSchema } from '@/schemas/tag';
import { ZodError } from 'zod';

type RouteContext = {
  params: Promise<{ id: string }>;
};

function validateTagId(id: string) {
  return tagIdSchema.safeParse({ id });
}

export async function PATCH(request: NextRequest, context: RouteContext) {
  const { id } = await context.params;

  if (!validateTagId(id).success) {
    return validationError('Invalid tag id', { id: 'Must be a valid UUID' });
  }

  const body = await request.json().catch(() => null);

  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    return validationError('Invalid tag payload', { body: 'Expected a JSON object body' });
  }

  try {
    const updated = await updateTag(id, body);
    if (!updated) return notFoundError('Tag not found');

    return successResponse(updated);
  } catch (error) {
    if (error instanceof ZodError) {
      return validationError('Invalid tag payload', error.issues);
    }

    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
      return conflictError('Tag slug must be unique');
    }

    return internalServerError('Failed to update tag');
  }
}

export async function DELETE(_: NextRequest, context: RouteContext) {
  const { id } = await context.params;

  if (!validateTagId(id).success) {
    return validationError('Invalid tag id', { id: 'Must be a valid UUID' });
  }

  try {
    const deleted = await deleteTag(id);

    if (!deleted) return notFoundError('Tag not found');

    return successResponse(deleted);
  } catch {
    return internalServerError('Failed to delete tag');
  }
}
