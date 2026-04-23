import { Prisma } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import { storyCreateSchema, storyIdSchema, storyUpdateSchema } from '@/schemas/story';
import { resolveStorySlug } from './slug';

const placeReferenceSelect = {
  id: true,
  name: true,
  slug: true,
  placeScale: true,
} satisfies Prisma.PlaceSelect;

const eventReferenceSelect = {
  id: true,
  title: true,
  slug: true,
  summary: true,
  eventDateText: true,
  startAt: true,
  endAt: true,
  datePrecision: true,
  place: {
    select: placeReferenceSelect,
  },
} satisfies Prisma.EventSelect;

const storySelect = {
  id: true,
  title: true,
  slug: true,
  summary: true,
  content: true,
  status: true,
  canonState: true,
  metadata: true,
  storyKind: true,
  primaryPlaceId: true,
  startDateText: true,
  endDateText: true,
  createdAt: true,
  updatedAt: true,
  deletedAt: true,
  primaryPlace: {
    select: placeReferenceSelect,
  },
} satisfies Prisma.StorySelect;

const storyDetailSelect = {
  ...storySelect,
  events: {
    where: { deletedAt: null },
    orderBy: [{ startAt: 'asc' }, { createdAt: 'asc' }],
    select: eventReferenceSelect,
  },
} satisfies Prisma.StorySelect;

export type StoryListRecord = Prisma.StoryGetPayload<{ select: typeof storySelect }>;
export type StoryRecord = Prisma.StoryGetPayload<{ select: typeof storyDetailSelect }>;

function isValidStoryId(id: string): boolean {
  return storyIdSchema.safeParse({ id }).success;
}

async function ensurePlaceExists(placeId: string): Promise<void> {
  const place = await prisma.place.findFirst({
    where: { id: placeId, deletedAt: null },
    select: { id: true },
  });

  if (!place) {
    throw new Error('Primary place not found');
  }
}

export async function listStories(): Promise<StoryListRecord[]> {
  return prisma.story.findMany({
    where: { deletedAt: null },
    orderBy: [{ updatedAt: 'desc' }],
    select: storySelect,
  });
}

export async function listStoriesByPlace(placeId: string): Promise<StoryListRecord[]> {
  // Returns stories anchored at this place (primaryPlaceId) OR stories that have
  // at least one event occurring here — so Place detail shows the full narrative picture.
  return prisma.story.findMany({
    where: {
      deletedAt: null,
      OR: [
        { primaryPlaceId: placeId },
        { events: { some: { placeId, deletedAt: null } } },
      ],
    },
    orderBy: [{ updatedAt: 'desc' }],
    select: storySelect,
  });
}

export async function getStory(id: string): Promise<StoryRecord | null> {
  if (!isValidStoryId(id)) {
    return null;
  }

  return prisma.story.findFirst({
    where: { id, deletedAt: null },
    select: storyDetailSelect,
  });
}

export async function createStory(input: unknown): Promise<StoryRecord> {
  const parsed = storyCreateSchema.parse(input);

  if (parsed.primaryPlaceId) {
    await ensurePlaceExists(parsed.primaryPlaceId);
  }

  const slug = await resolveStorySlug(parsed.title, parsed.slug);

  return prisma.story.create({
    data: {
      title: parsed.title,
      slug,
      summary: parsed.summary ?? null,
      content: parsed.content as Prisma.InputJsonValue | Prisma.NullableJsonNullValueInput | undefined,
      status: parsed.status ?? 'draft',
      canonState: parsed.canonState ?? 'canonical',
      metadata: parsed.metadata as Prisma.InputJsonValue | Prisma.NullableJsonNullValueInput | undefined,
      storyKind: parsed.storyKind ?? null,
      primaryPlaceId: parsed.primaryPlaceId ?? null,
      startDateText: parsed.startDateText ?? null,
      endDateText: parsed.endDateText ?? null,
    },
    select: storyDetailSelect,
  });
}

export async function updateStory(id: string, input: unknown): Promise<StoryRecord | null> {
  if (!isValidStoryId(id)) {
    return null;
  }

  const existing = await prisma.story.findFirst({ where: { id, deletedAt: null } });

  if (!existing) {
    return null;
  }

  const parsed = storyUpdateSchema.parse(input);
  const nextPrimaryPlaceId = parsed.primaryPlaceId === undefined ? existing.primaryPlaceId : parsed.primaryPlaceId;

  if (nextPrimaryPlaceId) {
    await ensurePlaceExists(nextPrimaryPlaceId);
  }

  const nextSlug = parsed.slug
    ? await resolveStorySlug(parsed.title ?? existing.title, parsed.slug, id)
    : existing.slug;

  return prisma.story.update({
    where: { id },
    data: {
      title: parsed.title ?? existing.title,
      slug: nextSlug,
      summary: parsed.summary === undefined ? existing.summary : parsed.summary,
      content: parsed.content === undefined ? existing.content : (parsed.content as Prisma.InputJsonValue | Prisma.NullableJsonNullValueInput),
      status: parsed.status ?? existing.status,
      canonState: parsed.canonState ?? existing.canonState,
      metadata: parsed.metadata === undefined ? existing.metadata : (parsed.metadata as Prisma.InputJsonValue | Prisma.NullableJsonNullValueInput),
      storyKind: parsed.storyKind === undefined ? existing.storyKind : parsed.storyKind,
      primaryPlaceId: nextPrimaryPlaceId ?? null,
      startDateText: parsed.startDateText === undefined ? existing.startDateText : parsed.startDateText,
      endDateText: parsed.endDateText === undefined ? existing.endDateText : parsed.endDateText,
    },
    select: storyDetailSelect,
  });
}

export async function deleteStory(id: string): Promise<StoryRecord | null> {
  if (!isValidStoryId(id)) {
    return null;
  }

  const existing = await prisma.story.findFirst({ where: { id, deletedAt: null } });

  if (!existing) {
    return null;
  }

  return prisma.$transaction(async (tx) => {
    await tx.event.updateMany({
      where: { storyId: id, deletedAt: null },
      data: { storyId: null },
    });

    return tx.story.update({
      where: { id },
      data: { deletedAt: new Date(), status: 'archived' },
      select: storyDetailSelect,
    });
  });
}
