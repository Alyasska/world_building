import { NextRequest } from 'next/server';
import { Prisma } from '@prisma/client';
import { createPlace, listPlaces, PlaceHierarchyError } from '@/server/place-service';
import { conflictError, internalServerError, successResponse, validationError } from '@/server/response';
import { ZodError } from 'zod';

export async function GET() {
  try {
    const places = await listPlaces();
    return successResponse(places);
  } catch {
    return internalServerError('Failed to list places');
  }
}

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);

  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    return validationError('Invalid place payload', { body: 'Expected a JSON object body' });
  }

  try {
    const place = await createPlace(body);
    return successResponse(place, 201);
  } catch (error) {
    if (error instanceof ZodError) {
      return validationError('Invalid place payload', error.issues);
    }

    if (error instanceof PlaceHierarchyError) {
      return validationError(error.message, { parentPlaceId: error.message });
    }

    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
      return conflictError('Place slug must be unique');
    }

    return internalServerError('Failed to create place');
  }
}
