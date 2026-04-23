import { NextRequest } from 'next/server';
import { Prisma } from '@prisma/client';
import { ZodError } from 'zod';
import { deleteStory, getStory, updateStory } from '@/server/story-service';
import { conflictError, internalServerError, notFoundError, successResponse, validationError } from '@/server/response';
import { storyIdSchema } from '@/schemas/story';

type RouteContext = {
  params: Promise<{ id: string }>;
};

function validateStoryId(id: string) {
  return storyIdSchema.safeParse({ id });
}

export async function GET(_: NextRequest, context: RouteContext) {
  const { id } = await context.params;

  if (!validateStoryId(id).success) {
    return validationError('Invalid story id', { id: 'Must be a valid UUID' });
  }

  try {
    const story = await getStory(id);

    if (!story) {
      return notFoundError('Story not found');
    }

    return successResponse(story);
  } catch {
    return internalServerError('Failed to get story');
  }
}

export async function PATCH(request: NextRequest, context: RouteContext) {
  const { id } = await context.params;

  if (!validateStoryId(id).success) {
    return validationError('Invalid story id', { id: 'Must be a valid UUID' });
  }

  const body = await request.json().catch(() => null);

  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    return validationError('Invalid story payload', { body: 'Expected a JSON object body' });
  }

  try {
    const updated = await updateStory(id, body);

    if (!updated) {
      return notFoundError('Story not found');
    }

    return successResponse(updated);
  } catch (error) {
    if (error instanceof ZodError) {
      return validationError('Invalid story payload', error.issues);
    }

    if (error instanceof Error && error.message === 'Primary place not found') {
      return validationError('Invalid story payload', { primaryPlaceId: error.message });
    }

    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
      return conflictError('Story slug must be unique');
    }

    return internalServerError('Failed to update story');
  }
}

export async function DELETE(_: NextRequest, context: RouteContext) {
  const { id } = await context.params;

  if (!validateStoryId(id).success) {
    return validationError('Invalid story id', { id: 'Must be a valid UUID' });
  }

  try {
    const deleted = await deleteStory(id);

    if (!deleted) {
      return notFoundError('Story not found');
    }

    return successResponse(deleted);
  } catch {
    return internalServerError('Failed to delete story');
  }
}
