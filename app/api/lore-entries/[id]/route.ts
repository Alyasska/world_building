import { NextRequest } from 'next/server';
import { Prisma } from '@prisma/client';
import { deleteLoreEntry, getLoreEntry, updateLoreEntry } from '@/server/lore-entry-service';
import { conflictError, internalServerError, notFoundError, successResponse, validationError } from '@/server/response';
import { loreEntryIdSchema } from '@/schemas/lore-entry';
import { ZodError } from 'zod';

type RouteContext = { params: Promise<{ id: string }> };

function validateId(id: string) {
  return loreEntryIdSchema.safeParse({ id });
}

export async function GET(_: NextRequest, context: RouteContext) {
  const { id } = await context.params;
  if (!validateId(id).success) return validationError('Invalid lore entry id', { id: 'Must be a valid UUID' });

  try {
    const entry = await getLoreEntry(id);
    if (!entry) return notFoundError('Lore entry not found');
    return successResponse(entry);
  } catch {
    return internalServerError('Failed to get lore entry');
  }
}

export async function PATCH(request: NextRequest, context: RouteContext) {
  const { id } = await context.params;
  if (!validateId(id).success) return validationError('Invalid lore entry id', { id: 'Must be a valid UUID' });

  const body = await request.json().catch(() => null);
  if (!body || typeof body !== 'object' || Array.isArray(body)) return validationError('Invalid lore entry payload', { body: 'Expected a JSON object body' });

  try {
    const updated = await updateLoreEntry(id, body);
    if (!updated) return notFoundError('Lore entry not found');
    return successResponse(updated);
  } catch (error) {
    if (error instanceof ZodError) return validationError('Invalid lore entry payload', error.issues);
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') return conflictError('Lore entry slug must be unique');
    return internalServerError('Failed to update lore entry');
  }
}

export async function DELETE(_: NextRequest, context: RouteContext) {
  const { id } = await context.params;
  if (!validateId(id).success) return validationError('Invalid lore entry id', { id: 'Must be a valid UUID' });

  try {
    const deleted = await deleteLoreEntry(id);
    if (!deleted) return notFoundError('Lore entry not found');
    return successResponse(deleted);
  } catch {
    return internalServerError('Failed to delete lore entry');
  }
}
