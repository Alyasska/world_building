import { NextRequest } from 'next/server';
import { Prisma } from '@prisma/client';
import { ZodError } from 'zod';
import { deleteEvent, getEvent, updateEvent } from '@/server/event-service';
import { conflictError, internalServerError, notFoundError, successResponse, validationError } from '@/server/response';
import { eventIdSchema } from '@/schemas/event';

type RouteContext = {
  params: Promise<{ id: string }>;
};

function validateEventId(id: string) {
  return eventIdSchema.safeParse({ id });
}

export async function GET(_: NextRequest, context: RouteContext) {
  const { id } = await context.params;

  if (!validateEventId(id).success) {
    return validationError('Invalid event id', { id: 'Must be a valid UUID' });
  }

  try {
    const event = await getEvent(id);

    if (!event) {
      return notFoundError('Event not found');
    }

    return successResponse(event);
  } catch {
    return internalServerError('Failed to get event');
  }
}

export async function PATCH(request: NextRequest, context: RouteContext) {
  const { id } = await context.params;

  if (!validateEventId(id).success) {
    return validationError('Invalid event id', { id: 'Must be a valid UUID' });
  }

  const body = await request.json().catch(() => null);

  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    return validationError('Invalid event payload', { body: 'Expected a JSON object body' });
  }

  try {
    const updated = await updateEvent(id, body);

    if (!updated) {
      return notFoundError('Event not found');
    }

    return successResponse(updated);
  } catch (error) {
    if (error instanceof ZodError) {
      return validationError('Invalid event payload', error.issues);
    }

    if (
      error instanceof Error &&
      ['Event place is required', 'Event place not found', 'Story not found'].includes(error.message)
    ) {
      return validationError('Invalid event payload', { relation: error.message });
    }

    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
      return conflictError('Event slug must be unique');
    }

    return internalServerError('Failed to update event');
  }
}

export async function DELETE(_: NextRequest, context: RouteContext) {
  const { id } = await context.params;

  if (!validateEventId(id).success) {
    return validationError('Invalid event id', { id: 'Must be a valid UUID' });
  }

  try {
    const deleted = await deleteEvent(id);

    if (!deleted) {
      return notFoundError('Event not found');
    }

    return successResponse(deleted);
  } catch {
    return internalServerError('Failed to delete event');
  }
}
