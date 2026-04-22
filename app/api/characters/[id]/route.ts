import { NextRequest, NextResponse } from 'next/server';
import { deleteCharacter, getCharacter, updateCharacter } from '@/server/character-service';
import { notFoundError, validationError } from '@/server/response';
import { ZodError } from 'zod';

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function GET(_: NextRequest, context: RouteContext) {
  const { id } = await context.params;
  const character = await getCharacter(id);

  if (!character) {
    return notFoundError('Character not found');
  }

  return NextResponse.json({ data: character });
}

export async function PATCH(request: NextRequest, context: RouteContext) {
  const { id } = await context.params;
  const body = await request.json().catch(() => null);

  try {
    const updated = await updateCharacter(id, body);
    if (!updated) {
      return notFoundError('Character not found');
    }

    return NextResponse.json({ data: updated });
  } catch (error) {
    if (error instanceof ZodError) {
      return validationError('Invalid character payload', error);
    }

    throw error;
  }
}

export async function DELETE(_: NextRequest, context: RouteContext) {
  const { id } = await context.params;
  const deleted = await deleteCharacter(id);

  if (!deleted) {
    return notFoundError('Character not found');
  }

  return NextResponse.json({ data: deleted });
}
