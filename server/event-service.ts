import { Prisma } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import { eventCreateSchema, eventIdSchema, eventUpdateSchema } from '@/schemas/event';
import { resolveEventSlug } from './slug';
import { toJsonWrite } from '@/lib/prisma-json';

const placeReferenceSelect = {
  id: true,
  name: true,
  slug: true,
  placeScale: true,
} satisfies Prisma.PlaceSelect;

const storyReferenceSelect = {
  id: true,
  title: true,
  slug: true,
} satisfies Prisma.StorySelect;

const eventSelect = {
  id: true,
  title: true,
  slug: true,
  summary: true,
  content: true,
  status: true,
  canonState: true,
  metadata: true,
  storyId: true,
  placeId: true,
  eventDateText: true,
  startAt: true,
  endAt: true,
  datePrecision: true,
  createdAt: true,
  updatedAt: true,
  deletedAt: true,
  story: {
    select: storyReferenceSelect,
  },
  place: {
    select: placeReferenceSelect,
  },
} satisfies Prisma.EventSelect;

export type EventRecord = Prisma.EventGetPayload<{ select: typeof eventSelect }>;

function isValidEventId(id: string): boolean {
  return eventIdSchema.safeParse({ id }).success;
}

function parseOptionalDate(value: string | Date | null | undefined): Date | null {
  if (!value) {
    return null;
  }

  const parsed = value instanceof Date ? value : new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

async function ensurePlaceExists(placeId: string): Promise<void> {
  const place = await prisma.place.findFirst({
    where: { id: placeId, deletedAt: null },
    select: { id: true },
  });

  if (!place) {
    throw new Error('Event place not found');
  }
}

async function ensureStoryExists(storyId: string): Promise<void> {
  const story = await prisma.story.findFirst({
    where: { id: storyId, deletedAt: null },
    select: { id: true },
  });

  if (!story) {
    throw new Error('Story not found');
  }
}

export async function listEvents(): Promise<EventRecord[]> {
  return prisma.event.findMany({
    where: { deletedAt: null },
    orderBy: [{ startAt: 'asc' }, { createdAt: 'asc' }],
    select: eventSelect,
  });
}

export async function listEventsByPlace(placeId: string): Promise<EventRecord[]> {
  return prisma.event.findMany({
    where: { deletedAt: null, placeId },
    orderBy: [{ startAt: 'asc' }, { createdAt: 'asc' }],
    select: eventSelect,
  });
}

export async function listEventsByStory(storyId: string): Promise<EventRecord[]> {
  return prisma.event.findMany({
    where: { deletedAt: null, storyId },
    orderBy: [{ startAt: 'asc' }, { createdAt: 'asc' }],
    select: eventSelect,
  });
}

export async function getEvent(id: string): Promise<EventRecord | null> {
  if (!isValidEventId(id)) {
    return null;
  }

  return prisma.event.findFirst({
    where: { id, deletedAt: null },
    select: eventSelect,
  });
}

export async function createEvent(input: unknown): Promise<EventRecord> {
  const parsed = eventCreateSchema.parse(input);

  if (!parsed.placeId) {
    throw new Error('Event place is required');
  }

  await ensurePlaceExists(parsed.placeId);

  if (parsed.storyId) {
    await ensureStoryExists(parsed.storyId);
  }

  const slug = await resolveEventSlug(parsed.title, parsed.slug);

  return prisma.event.create({
    data: {
      title: parsed.title,
      slug,
      summary: parsed.summary ?? null,
      content: parsed.content as Prisma.InputJsonValue | Prisma.NullableJsonNullValueInput | undefined,
      status: parsed.status ?? 'draft',
      canonState: parsed.canonState ?? 'canonical',
      metadata: parsed.metadata as Prisma.InputJsonValue | Prisma.NullableJsonNullValueInput | undefined,
      storyId: parsed.storyId ?? null,
      placeId: parsed.placeId,
      eventDateText: parsed.eventDateText ?? null,
      startAt: parseOptionalDate(parsed.startAt),
      endAt: parseOptionalDate(parsed.endAt),
      datePrecision: parsed.datePrecision ?? 'unknown',
    },
    select: eventSelect,
  });
}

export async function updateEvent(id: string, input: unknown): Promise<EventRecord | null> {
  if (!isValidEventId(id)) {
    return null;
  }

  const existing = await prisma.event.findFirst({ where: { id, deletedAt: null } });

  if (!existing) {
    return null;
  }

  const parsed = eventUpdateSchema.parse(input);
  const nextPlaceId = parsed.placeId === undefined ? existing.placeId : parsed.placeId;
  const nextStoryId = parsed.storyId === undefined ? existing.storyId : parsed.storyId;

  if (!nextPlaceId) {
    throw new Error('Event place is required');
  }

  await ensurePlaceExists(nextPlaceId);

  if (nextStoryId) {
    await ensureStoryExists(nextStoryId);
  }

  const nextSlug = parsed.slug
    ? await resolveEventSlug(parsed.title ?? existing.title, parsed.slug, id)
    : existing.slug;

  await prisma.event.update({
    where: { id },
    data: {
      title: parsed.title ?? existing.title,
      slug: nextSlug,
      summary: parsed.summary === undefined ? existing.summary : parsed.summary,
      content: parsed.content === undefined ? toJsonWrite(existing.content) : (parsed.content as Prisma.InputJsonValue | Prisma.NullableJsonNullValueInput),
      status: parsed.status ?? existing.status,
      canonState: parsed.canonState ?? existing.canonState,
      metadata: parsed.metadata === undefined ? toJsonWrite(existing.metadata) : (parsed.metadata as Prisma.InputJsonValue | Prisma.NullableJsonNullValueInput),
      storyId: nextStoryId ?? null,
      placeId: nextPlaceId,
      eventDateText: parsed.eventDateText === undefined ? existing.eventDateText : parsed.eventDateText,
      startAt: parsed.startAt === undefined ? existing.startAt : parseOptionalDate(parsed.startAt),
      endAt: parsed.endAt === undefined ? existing.endAt : parseOptionalDate(parsed.endAt),
      datePrecision: parsed.datePrecision ?? existing.datePrecision,
    },
  });

  return getEvent(id);
}

export async function deleteEvent(id: string): Promise<EventRecord | null> {
  if (!isValidEventId(id)) {
    return null;
  }

  const existing = await prisma.event.findFirst({ where: { id, deletedAt: null } });

  if (!existing) {
    return null;
  }

  return prisma.$transaction(async (tx) => {
    await tx.eventParticipant.updateMany({
      where: {
        eventId: id,
        deletedAt: null,
      },
      data: {
        deletedAt: new Date(),
        status: 'archived',
      },
    });

    return tx.event.update({
      where: { id },
      data: { deletedAt: new Date(), status: 'archived' },
      select: eventSelect,
    });
  });
}
