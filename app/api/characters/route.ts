import { NextRequest } from 'next/server';
import { Prisma } from '@prisma/client';
import { createCharacter, listCharacters } from '@/server/character-service';
import { conflictError, internalServerError, successResponse, validationError } from '@/server/response';
import { ZodError } from 'zod';

export async function GET() {
  try {
    const characters = await listCharacters();
    return successResponse(characters);
  } catch {
    return internalServerError('Failed to list characters');
  }
}

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);

  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    return validationError('Invalid character payload', { body: 'Expected a JSON object body' });
  }

  try {
    const character = await createCharacter(body);
    return successResponse(character, 201);
  } catch (error) {
    if (error instanceof ZodError) {
      return validationError('Invalid character payload', error.issues);
    }

    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
      return conflictError('Character slug must be unique');
    }

    return internalServerError('Failed to create character');
  }
}
