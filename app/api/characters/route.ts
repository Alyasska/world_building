import { NextRequest, NextResponse } from 'next/server';
import { createCharacter, listCharacters } from '@/server/character-service';
import { validationError } from '@/server/response';
import { ZodError } from 'zod';

export async function GET() {
  const characters = await listCharacters();
  return NextResponse.json({ data: characters });
}

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  try {
    const character = await createCharacter(body);
    return NextResponse.json({ data: character }, { status: 201 });
  } catch (error) {
    if (error instanceof ZodError) {
      return validationError('Invalid character payload', error);
    }

    throw error;
  }
}
