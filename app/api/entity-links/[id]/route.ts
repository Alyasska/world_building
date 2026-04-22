import { NextRequest, NextResponse } from 'next/server';
import { deleteEntityLink } from '@/server/entity-link-service';
import { notFoundError } from '@/server/response';

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function DELETE(_: NextRequest, context: RouteContext) {
  const { id } = await context.params;
  const deleted = await deleteEntityLink(id);

  if (!deleted) return notFoundError('Entity link not found');

  return NextResponse.json({ data: deleted });
}
