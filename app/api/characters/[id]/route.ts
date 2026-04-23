import { NextRequest } from 'next/server';
import { Prisma } from '@prisma/client';
import { deleteCharacter, getCharacter, updateCharacter } from '@/server/character-service';
import { conflictError, internalServerError, notFoundError, successResponse, validationError } from '@/server/response';
import { characterIdSchema } from '@/schemas/character';
import { ZodError } from 'zod';

type RouteContext = {
  params: Promise<{ id: string }>;
};

function validateCharacterId(id: string) {
  return characterIdSchema.safeParse({ id });
}

export async function GET(_: NextRequest, context: RouteContext) {
  const { id } = await context.params;

  if (!validateCharacterId(id).success) {
    return validationError('Invalid character id', { id: 'Must be a valid UUID' });
  }

  try {
    const character = await getCharacter(id);

    if (!character) {
      return notFoundError('Character not found');
    }

    return successResponse(character);
  } catch {
    return internalServerError('Failed to get character');
  }
}

export async function PATCH(request: NextRequest, context: RouteContext) {
  const { id } = await context.params;

  if (!validateCharacterId(id).success) {
    return validationError('Invalid character id', { id: 'Must be a valid UUID' });
  }

  const body = await request.json().catch(() => null);

  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    return validationError('Invalid character payload', { body: 'Expected a JSON object body' });
  }

  try {
    const updated = await updateCharacter(id, body);
    if (!updated) {
      return notFoundError('Character not found');
    }

    return successResponse(updated);
  } catch (error) {
    if (error instanceof ZodError) {
      return validationError('Invalid character payload', error.issues);
    }

    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
      return conflictError('Character slug must be unique');
    }

    return internalServerError('Failed to update character');
  }
}

export async function DELETE(_: NextRequest, context: RouteContext) {
  const { id } = await context.params;

  if (!validateCharacterId(id).success) {
    return validationError('Invalid character id', { id: 'Must be a valid UUID' });
  }

  try {
    const deleted = await deleteCharacter(id);

    if (!deleted) {
      return notFoundError('Character not found');
    }

    return successResponse(deleted);
  } catch {
    return internalServerError('Failed to delete character');
  }
}
