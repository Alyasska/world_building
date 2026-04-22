import { NextRequest, NextResponse } from 'next/server';
import { createPlace, listPlaces } from '@/server/place-service';
import { validationError } from '@/server/response';
import { ZodError } from 'zod';

export async function GET() {
  const places = await listPlaces();
  return NextResponse.json({ data: places });
}

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  try {
    const place = await createPlace(body);
    return NextResponse.json({ data: place }, { status: 201 });
  } catch (error) {
    if (error instanceof ZodError) {
      return validationError('Invalid place payload', error);
    }

    throw error;
  }
}
