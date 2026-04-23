import { NextRequest } from 'next/server';
import { Prisma } from '@prisma/client';
import { deleteAsset, getAsset, updateAsset } from '@/server/asset-service';
import { conflictError, internalServerError, notFoundError, successResponse, validationError } from '@/server/response';
import { assetIdSchema } from '@/schemas/asset';
import { ZodError } from 'zod';

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(_: NextRequest, context: RouteContext) {
  const { id } = await context.params;
  if (!assetIdSchema.safeParse({ id }).success) return validationError('Invalid id', { id: 'Must be a valid UUID' });
  try {
    const item = await getAsset(id);
    if (!item) return notFoundError('Asset not found');
    return successResponse(item);
  } catch {
    return internalServerError('Failed to get asset');
  }
}

export async function PATCH(request: NextRequest, context: RouteContext) {
  const { id } = await context.params;
  if (!assetIdSchema.safeParse({ id }).success) return validationError('Invalid id', { id: 'Must be a valid UUID' });
  const body = await request.json().catch(() => null);
  if (!body || typeof body !== 'object' || Array.isArray(body)) return validationError('Invalid payload', { body: 'Expected a JSON object body' });
  try {
    const updated = await updateAsset(id, body);
    if (!updated) return notFoundError('Asset not found');
    return successResponse(updated);
  } catch (error) {
    if (error instanceof ZodError) return validationError('Invalid payload', error.issues);
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') return conflictError('Slug must be unique');
    return internalServerError('Failed to update asset');
  }
}

export async function DELETE(_: NextRequest, context: RouteContext) {
  const { id } = await context.params;
  if (!assetIdSchema.safeParse({ id }).success) return validationError('Invalid id', { id: 'Must be a valid UUID' });
  try {
    const deleted = await deleteAsset(id);
    if (!deleted) return notFoundError('Asset not found');
    return successResponse(deleted);
  } catch {
    return internalServerError('Failed to delete asset');
  }
}
