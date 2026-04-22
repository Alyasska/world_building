import { NextRequest, NextResponse } from 'next/server';
import { deleteTag, updateTag } from '@/server/tag-service';
import { notFoundError, validationError } from '@/server/response';
import { ZodError } from 'zod';

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function PATCH(request: NextRequest, context: RouteContext) {
  const { id } = await context.params;
  const body = await request.json().catch(() => null);

  try {
    const updated = await updateTag(id, body);
    if (!updated) return notFoundError('Tag not found');

    return NextResponse.json({ data: updated });
  } catch (error) {
    if (error instanceof ZodError) {
      return validationError('Invalid tag payload', error);
    }

    throw error;
  }
}

export async function DELETE(_: NextRequest, context: RouteContext) {
  const { id } = await context.params;
  const deleted = await deleteTag(id);

  if (!deleted) return notFoundError('Tag not found');

  return NextResponse.json({ data: deleted });
}
