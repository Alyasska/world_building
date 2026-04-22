import { NextRequest, NextResponse } from 'next/server';
import { deletePlace, getPlace, updatePlace } from '@/server/place-service';
import { notFoundError, validationError } from '@/server/response';
import { ZodError } from 'zod';

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function GET(_: NextRequest, context: RouteContext) {
  const { id } = await context.params;
  const place = await getPlace(id);

  if (!place) {
    return notFoundError('Place not found');
  }

  return NextResponse.json({ data: place });
}

export async function PATCH(request: NextRequest, context: RouteContext) {
  const { id } = await context.params;
  const body = await request.json().catch(() => null);

  try {
    const updated = await updatePlace(id, body);
    if (!updated) {
      return notFoundError('Place not found');
    }

    return NextResponse.json({ data: updated });
  } catch (error) {
    if (error instanceof ZodError) {
      return validationError('Invalid place payload', error);
    }

    throw error;
  }
}

export async function DELETE(_: NextRequest, context: RouteContext) {
  const { id } = await context.params;
  const deleted = await deletePlace(id);

  if (!deleted) {
    return notFoundError('Place not found');
  }

  return NextResponse.json({ data: deleted });
}
