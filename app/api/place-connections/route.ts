import { NextRequest } from 'next/server';
import { createPlaceConnection } from '@/server/place-connection-service';
import { internalServerError, successResponse, validationError } from '@/server/response';
import { ZodError } from 'zod';

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  if (!body || typeof body !== 'object' || Array.isArray(body)) return validationError('Invalid payload', { body: 'Expected a JSON object body' });

  try {
    return successResponse(await createPlaceConnection(body), 201);
  } catch (error) {
    if (error instanceof ZodError) return validationError('Invalid payload', error.issues);
    if (error instanceof Error) return validationError(error.message, {});
    return internalServerError('Failed to create place connection');
  }
}
