import { NextRequest } from 'next/server';
import { Prisma } from '@prisma/client';
import { createTag, listTags } from '@/server/tag-service';
import { conflictError, internalServerError, successResponse, validationError } from '@/server/response';
import { ZodError } from 'zod';

export async function GET() {
  try {
    const tags = await listTags();
    return successResponse(tags);
  } catch {
    return internalServerError('Failed to list tags');
  }
}

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);

  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    return validationError('Invalid tag payload', { body: 'Expected a JSON object body' });
  }

  try {
    const tag = await createTag(body);
    return successResponse(tag, 201);
  } catch (error) {
    if (error instanceof ZodError) {
      return validationError('Invalid tag payload', error.issues);
    }

    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
      return conflictError('Tag slug must be unique');
    }

    return internalServerError('Failed to create tag');
  }
}
