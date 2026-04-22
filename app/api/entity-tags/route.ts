import { NextRequest } from 'next/server';
import { createEntityTag, listEntityTags } from '@/server/entity-tag-service';
import { internalServerError, notFoundError, successResponse, validationError } from '@/server/response';
import { ZodError } from 'zod';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const entityType = searchParams.get('entityType') ?? undefined;
  const entityId = searchParams.get('entityId') ?? undefined;

  try {
    const tags = await listEntityTags(entityType, entityId);
    return successResponse(tags);
  } catch {
    return internalServerError('Failed to list entity tags');
  }
}

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);

  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    return validationError('Invalid entity tag payload', { body: 'Expected a JSON object body' });
  }

  try {
    const entityTag = await createEntityTag(body);
    return successResponse(entityTag, 201);
  } catch (error) {
    if (error instanceof ZodError) {
      return validationError('Invalid entity tag payload', error.issues);
    }

    if (error instanceof Error && error.message === 'Tag not found') {
      return notFoundError('Tag not found');
    }

    if (error instanceof Error && error.message === 'Target entity not found') {
      return notFoundError('Target entity not found');
    }

    return internalServerError('Failed to attach tag');
  }
}
