import { NextRequest, NextResponse } from 'next/server';
import { deleteEntityTag } from '@/server/entity-tag-service';
import { notFoundError } from '@/server/response';

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function DELETE(_: NextRequest, context: RouteContext) {
  const { id } = await context.params;
  const deleted = await deleteEntityTag(id);

  if (!deleted) return notFoundError('Entity tag not found');

  return NextResponse.json({ data: deleted });
}
