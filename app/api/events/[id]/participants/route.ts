import { NextRequest } from 'next/server';
import { ZodError } from 'zod';
import { validationError, successResponse, internalServerError, notFoundError } from '@/server/response';
import { eventIdSchema } from '@/schemas/event';
import { createEventParticipant, listEventParticipants } from '@/server/event-participant-service';

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
    const participants = await listEventParticipants(id);
    return successResponse(participants);
  } catch {
    return internalServerError('Failed to list event participants');
  }
}

export async function POST(request: NextRequest, context: RouteContext) {
  const { id } = await context.params;

  if (!validateEventId(id).success) {
    return validationError('Invalid event id', { id: 'Must be a valid UUID' });
  }

  const body = await request.json().catch(() => null);

  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    return validationError('Invalid event participant payload', { body: 'Expected a JSON object body' });
  }

  try {
    const participant = await createEventParticipant(id, body);
    return successResponse(participant, 201);
  } catch (error) {
    if (error instanceof ZodError) {
      return validationError('Invalid event participant payload', error.issues);
    }

    if (error instanceof Error && error.message === 'Event not found') {
      return notFoundError('Event not found');
    }

    if (error instanceof Error && error.message === 'Participant not found') {
      return validationError('Invalid event participant payload', { participantId: 'Participant not found' });
    }

    if (error instanceof Error && error.message.startsWith('Unsupported participantType')) {
      return validationError('Invalid event participant payload', { participantType: error.message });
    }

    return internalServerError('Failed to add event participant');
  }
}