import { NextRequest } from 'next/server';
import { Prisma } from '@prisma/client';
import { ZodError } from 'zod';
import { createEvent, listEvents } from '@/server/event-service';
import { conflictError, internalServerError, successResponse, validationError } from '@/server/response';

export async function GET() {
  try {
    const events = await listEvents();
    return successResponse(events);
  } catch {
    return internalServerError('Failed to list events');
  }
}

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);

  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    return validationError('Invalid event payload', { body: 'Expected a JSON object body' });
  }

  try {
    const event = await createEvent(body);
    return successResponse(event, 201);
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

    return internalServerError('Failed to create event');
  }
}
