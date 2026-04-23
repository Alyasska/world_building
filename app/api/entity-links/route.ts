import { NextRequest } from 'next/server';
import { createEntityLink, listEntityLinks } from '@/server/entity-link-service';
import { internalServerError, notFoundError, successResponse, validationError } from '@/server/response';
import { ZodError } from 'zod';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const entityType = searchParams.get('entityType') ?? undefined;
  const entityId = searchParams.get('entityId') ?? undefined;

  try {
    const links = await listEntityLinks(entityType, entityId);
    return successResponse(links);
  } catch {
    return internalServerError('Failed to list entity links');
  }
}

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);

  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    return validationError('Invalid entity link payload', { body: 'Expected a JSON object body' });
  }

  try {
    const link = await createEntityLink(body);
    return successResponse(link, 201);
  } catch (error) {
    if (error instanceof ZodError) {
      return validationError('Invalid entity link payload', error.issues);
    }

    if (error instanceof Error && error.message === 'Source and target entity types must be different') {
      return validationError('Invalid entity link payload', { relation: 'Source and target entity types must be different' });
    }

    if (error instanceof Error && error.message === 'Target entity not found') {
      return notFoundError('Target entity not found');
    }

    return internalServerError('Failed to create entity link');
  }
}
