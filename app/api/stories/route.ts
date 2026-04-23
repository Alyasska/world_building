import { NextRequest } from 'next/server';
import { Prisma } from '@prisma/client';
import { ZodError } from 'zod';
import { createStory, listStories } from '@/server/story-service';
import { conflictError, internalServerError, successResponse, validationError } from '@/server/response';

export async function GET() {
  try {
    const stories = await listStories();
    return successResponse(stories);
  } catch {
    return internalServerError('Failed to list stories');
  }
}

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);

  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    return validationError('Invalid story payload', { body: 'Expected a JSON object body' });
  }

  try {
    const story = await createStory(body);
    return successResponse(story, 201);
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

    return internalServerError('Failed to create story');
  }
}
