import { NextRequest } from 'next/server';
import { Prisma } from '@prisma/client';
import { createAsset, listAssets } from '@/server/asset-service';
import { conflictError, internalServerError, successResponse, validationError } from '@/server/response';
import { ZodError } from 'zod';

export async function GET() {
  try {
    return successResponse(await listAssets());
  } catch {
    return internalServerError('Failed to list assets');
  }
}

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  if (!body || typeof body !== 'object' || Array.isArray(body)) return validationError('Invalid payload', { body: 'Expected a JSON object body' });

  try {
    return successResponse(await createAsset(body), 201);
  } catch (error) {
    if (error instanceof ZodError) return validationError('Invalid payload', error.issues);
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') return conflictError('Slug must be unique');
    return internalServerError('Failed to create asset');
  }
}
