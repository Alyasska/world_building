import { NextRequest, NextResponse } from 'next/server';
import { createEntityTag, listEntityTags } from '@/server/entity-tag-service';
import { validationError } from '@/server/response';
import { ZodError } from 'zod';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const entityType = searchParams.get('entityType') ?? undefined;
  const entityId = searchParams.get('entityId') ?? undefined;

  const tags = await listEntityTags(entityType, entityId);
  return NextResponse.json({ data: tags });
}

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);

  try {
    const entityTag = await createEntityTag(body);
    return NextResponse.json({ data: entityTag }, { status: 201 });
  } catch (error) {
    if (error instanceof ZodError) {
      return validationError('Invalid entity tag payload', error);
    }

    throw error;
  }
}
