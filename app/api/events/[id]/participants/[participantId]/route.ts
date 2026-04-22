import { NextRequest } from 'next/server';
import { ZodError } from 'zod';
import {
  validationError,
  successResponse,
  internalServerError,
  notFoundError,
} from '@/server/response';
import { eventIdSchema } from '@/schemas/event';
import { eventParticipantIdSchema } from '@/schemas/event-participant';
import {
  deleteEventParticipant,
  updateEventParticipant,
} from '@/server/event-participant-service';

type RouteContext = {
  params: Promise<{ id: string; participantId: string }>;
};

function validateEventId(id: string) {
  return eventIdSchema.safeParse({ id });
}

function validateParticipantId(id: string) {
  return eventParticipantIdSchema.safeParse({ id });
}

export async function PATCH(request: NextRequest, context: RouteContext) {
  const { id, participantId } = await context.params;

  if (!validateEventId(id).success) {
    return validationError('Invalid event id', { id: 'Must be a valid UUID' });
  }

  if (!validateParticipantId(participantId).success) {
    return validationError('Invalid participant id', { participantId: 'Must be a valid UUID' });
  }

  const body = await request.json().catch(() => null);

  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    return validationError('Invalid event participant payload', { body: 'Expected a JSON object body' });
  }

  try {
    const updated = await updateEventParticipant(id, participantId, body);

    if (!updated) {
      return notFoundError('Event participant not found');
    }

    return successResponse(updated);
  } catch (error) {
    if (error instanceof ZodError) {
      return validationError('Invalid event participant payload', error.issues);
    }

    return internalServerError('Failed to update event participant');
  }
}

export async function DELETE(_: NextRequest, context: RouteContext) {
  const { id, participantId } = await context.params;

  if (!validateEventId(id).success) {
    return validationError('Invalid event id', { id: 'Must be a valid UUID' });
  }

  if (!validateParticipantId(participantId).success) {
    return validationError('Invalid participant id', { participantId: 'Must be a valid UUID' });
  }

  try {
    const deleted = await deleteEventParticipant(id, participantId);

    if (!deleted) {
      return notFoundError('Event participant not found');
    }

    return successResponse(deleted);
  } catch {
    return internalServerError('Failed to remove event participant');
  }
}