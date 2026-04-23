import { NextRequest } from 'next/server';
import { Prisma } from '@prisma/client';
import { deleteFaction, getFaction, updateFaction } from '@/server/faction-service';
import { conflictError, internalServerError, notFoundError, successResponse, validationError } from '@/server/response';
import { factionIdSchema } from '@/schemas/faction';
import { ZodError } from 'zod';

type RouteContext = {
  params: Promise<{ id: string }>;
};

function validateFactionId(id: string) {
  return factionIdSchema.safeParse({ id });
}

export async function GET(_: NextRequest, context: RouteContext) {
  const { id } = await context.params;

  if (!validateFactionId(id).success) {
    return validationError('Invalid faction id', { id: 'Must be a valid UUID' });
  }

  try {
    const faction = await getFaction(id);

    if (!faction) {
      return notFoundError('Faction not found');
    }

    return successResponse(faction);
  } catch {
    return internalServerError('Failed to get faction');
  }
}

export async function PATCH(request: NextRequest, context: RouteContext) {
  const { id } = await context.params;

  if (!validateFactionId(id).success) {
    return validationError('Invalid faction id', { id: 'Must be a valid UUID' });
  }

  const body = await request.json().catch(() => null);

  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    return validationError('Invalid faction payload', { body: 'Expected a JSON object body' });
  }

  try {
    const updated = await updateFaction(id, body);
    if (!updated) {
      return notFoundError('Faction not found');
    }

    return successResponse(updated);
  } catch (error) {
    if (error instanceof ZodError) {
      return validationError('Invalid faction payload', error.issues);
    }

    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
      return conflictError('Faction slug must be unique');
    }

    return internalServerError('Failed to update faction');
  }
}

export async function DELETE(_: NextRequest, context: RouteContext) {
  const { id } = await context.params;

  if (!validateFactionId(id).success) {
    return validationError('Invalid faction id', { id: 'Must be a valid UUID' });
  }

  try {
    const deleted = await deleteFaction(id);

    if (!deleted) {
      return notFoundError('Faction not found');
    }

    return successResponse(deleted);
  } catch {
    return internalServerError('Failed to delete faction');
  }
}
