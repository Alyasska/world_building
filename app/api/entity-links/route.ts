import { NextRequest, NextResponse } from 'next/server';
import { createEntityLink, listEntityLinks } from '@/server/entity-link-service';
import { validationError } from '@/server/response';
import { ZodError } from 'zod';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const entityType = searchParams.get('entityType') ?? undefined;
  const entityId = searchParams.get('entityId') ?? undefined;

  const links = await listEntityLinks(entityType, entityId);
  return NextResponse.json({ data: links });
}

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);

  try {
    const link = await createEntityLink(body);
    return NextResponse.json({ data: link }, { status: 201 });
  } catch (error) {
    if (error instanceof ZodError) {
      return validationError('Invalid entity link payload', error);
    }

    throw error;
  }
}
