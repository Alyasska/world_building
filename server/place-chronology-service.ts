import { Prisma } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import type { EventDatePrecision } from '@/lib/event-date-precision';

const storyReferenceSelect = {
  id: true,
  title: true,
  slug: true,
} satisfies Prisma.StorySelect;

const characterReferenceSelect = {
  id: true,
  name: true,
  slug: true,
} satisfies Prisma.CharacterSelect;

const chronologyEventSelect = {
  id: true,
  title: true,
  slug: true,
  summary: true,
  eventDateText: true,
  startAt: true,
  endAt: true,
  datePrecision: true,
  createdAt: true,
  participants: {
    where: {
      deletedAt: null,
      participantType: 'character',
    },
    orderBy: [{ createdAt: 'asc' }],
    select: {
      participantId: true,
      participantRole: true,
      sequence: true,
      createdAt: true,
    },
  },
  story: {
    select: storyReferenceSelect,
  },
} satisfies Prisma.EventSelect;

type ChronologyEventQueryRecord = Prisma.EventGetPayload<{ select: typeof chronologyEventSelect }>;

type ChronologyAnchor = {
  timestamp: number;
  source: 'startAt' | 'endAt' | 'eventDateText';
};

export type PlaceChronologyEvent = Omit<ChronologyEventQueryRecord, 'participants'> & {
  participants: Array<Prisma.CharacterGetPayload<{ select: typeof characterReferenceSelect }> & {
    role: string | null;
    sequence: number | null;
  }>;
};

export type PlaceChronologyStoryGroup = {
  story: PlaceChronologyEvent['story'];
  events: PlaceChronologyEvent[];
};

export type PlaceChronologySection = {
  id: string;
  year: number | null;
  groups: PlaceChronologyStoryGroup[];
};

const precisionRank: Record<EventDatePrecision, number> = {
  exact: 0,
  day: 1,
  month: 2,
  year: 3,
  range: 4,
  circa: 5,
  unknown: 6,
};

function parseIsoLikeDate(value: string): Date | null {
  const trimmed = value.trim();

  const yearMatch = /^\d{1,4}$/.exec(trimmed);
  if (yearMatch) {
    const year = Number(yearMatch[0]);
    return new Date(Date.UTC(year, 0, 1));
  }

  const monthMatch = /^(\d{1,4})-(\d{1,2})$/.exec(trimmed);
  if (monthMatch) {
    const year = Number(monthMatch[1]);
    const month = Number(monthMatch[2]);
    if (month >= 1 && month <= 12) {
      return new Date(Date.UTC(year, month - 1, 1));
    }
  }

  const dayMatch = /^(\d{1,4})-(\d{1,2})-(\d{1,2})$/.exec(trimmed);
  if (dayMatch) {
    const year = Number(dayMatch[1]);
    const month = Number(dayMatch[2]);
    const day = Number(dayMatch[3]);
    if (month >= 1 && month <= 12 && day >= 1 && day <= 31) {
      return new Date(Date.UTC(year, month - 1, day));
    }
  }

  return null;
}

function parseTextDate(eventDateText: string | null): Date | null {
  if (!eventDateText) {
    return null;
  }

  const normalized = eventDateText.trim();
  if (!normalized) {
    return null;
  }

  const isoDate = parseIsoLikeDate(normalized);
  if (isoDate) {
    return isoDate;
  }

  const fallback = Date.parse(normalized);
  if (Number.isNaN(fallback)) {
    return null;
  }

  return new Date(fallback);
}

function resolveAnchor(event: PlaceChronologyEvent): ChronologyAnchor | null {
  if (event.startAt) {
    return { timestamp: event.startAt.getTime(), source: 'startAt' };
  }

  if (event.endAt) {
    return { timestamp: event.endAt.getTime(), source: 'endAt' };
  }

  const parsedTextDate = parseTextDate(event.eventDateText ?? null);
  if (parsedTextDate) {
    return { timestamp: parsedTextDate.getTime(), source: 'eventDateText' };
  }

  return null;
}

function resolveYear(event: PlaceChronologyEvent, anchor: ChronologyAnchor | null): number | null {
  if (anchor) {
    return new Date(anchor.timestamp).getUTCFullYear();
  }

  const yearMatch = event.eventDateText?.trim().match(/(\d{3,4})/);
  return yearMatch ? Number(yearMatch[1]) : null;
}

function compareChronologyEvents(left: PlaceChronologyEvent, right: PlaceChronologyEvent): number {
  const leftAnchor = resolveAnchor(left);
  const rightAnchor = resolveAnchor(right);

  if (leftAnchor && rightAnchor) {
    if (leftAnchor.timestamp !== rightAnchor.timestamp) {
      return leftAnchor.timestamp - rightAnchor.timestamp;
    }

    if (leftAnchor.source !== rightAnchor.source) {
      if (leftAnchor.source === 'eventDateText') {
        return 1;
      }

      if (rightAnchor.source === 'eventDateText') {
        return -1;
      }
    }
  } else if (leftAnchor && !rightAnchor) {
    return -1;
  } else if (!leftAnchor && rightAnchor) {
    return 1;
  }

  const leftPrecision = precisionRank[(left.datePrecision ?? 'unknown') as EventDatePrecision] ?? precisionRank.unknown;
  const rightPrecision = precisionRank[(right.datePrecision ?? 'unknown') as EventDatePrecision] ?? precisionRank.unknown;

  if (leftPrecision !== rightPrecision) {
    return leftPrecision - rightPrecision;
  }

  const leftCreatedAt = left.createdAt.getTime();
  const rightCreatedAt = right.createdAt.getTime();
  if (leftCreatedAt !== rightCreatedAt) {
    return leftCreatedAt - rightCreatedAt;
  }

  return left.title.localeCompare(right.title, undefined, { sensitivity: 'base' });
}

function groupEventsByStoryRuns(events: PlaceChronologyEvent[]): PlaceChronologyStoryGroup[] {
  const groups: PlaceChronologyStoryGroup[] = [];

  for (const event of events) {
    const previousGroup = groups[groups.length - 1];
    const previousStoryId = previousGroup?.story?.id ?? null;
    const currentStoryId = event.story?.id ?? null;

    if (previousGroup && previousStoryId === currentStoryId) {
      previousGroup.events.push(event);
      continue;
    }

    groups.push({
      story: event.story,
      events: [event],
    });
  }

  return groups;
}

function compareChronologyParticipants(
  left: ChronologyEventQueryRecord['participants'][number],
  right: ChronologyEventQueryRecord['participants'][number]
): number {
  const leftSequence = left.sequence ?? null;
  const rightSequence = right.sequence ?? null;

  if (leftSequence !== null && rightSequence !== null && leftSequence !== rightSequence) {
    return leftSequence - rightSequence;
  }

  if (leftSequence !== null && rightSequence === null) {
    return -1;
  }

  if (leftSequence === null && rightSequence !== null) {
    return 1;
  }

  const createdAtDifference = left.createdAt.getTime() - right.createdAt.getTime();
  if (createdAtDifference !== 0) {
    return createdAtDifference;
  }

  return left.participantId.localeCompare(right.participantId);
}

export async function getPlaceChronology(placeId: string): Promise<PlaceChronologySection[]> {
  const events = await prisma.event.findMany({
    where: {
      deletedAt: null,
      placeId,
    },
    select: chronologyEventSelect,
  });

  const participantCharacterIds = Array.from(
    new Set(
      events.flatMap((event) => event.participants.map((participant) => participant.participantId))
    )
  );

  const participantCharacters = participantCharacterIds.length
    ? await prisma.character.findMany({
        where: {
          deletedAt: null,
          id: { in: participantCharacterIds },
        },
        select: characterReferenceSelect,
      })
    : [];

  const participantCharacterById = new Map(participantCharacters.map((character) => [character.id, character]));

  const mappedEvents: PlaceChronologyEvent[] = events.map((event) => ({
    ...event,
    participants: [...event.participants]
      .sort(compareChronologyParticipants)
      .map((participant) => {
        const character = participantCharacterById.get(participant.participantId);

        if (!character) {
          return null;
        }

        return {
          ...character,
          role:
            participant.participantRole?.trim().length
              ? participant.participantRole
              : null,
          sequence: participant.sequence ?? null,
        };
      })
      .filter((value): value is PlaceChronologyEvent['participants'][number] => value !== null),
  }));

  const sorted = [...mappedEvents].sort(compareChronologyEvents);
  const sectionMap = new Map<string, { year: number | null; events: PlaceChronologyEvent[] }>();

  for (const event of sorted) {
    const sectionYear = resolveYear(event, resolveAnchor(event));
    const sectionKey = sectionYear === null ? 'undated' : `year-${sectionYear}`;
    const existing = sectionMap.get(sectionKey);

    if (existing) {
      existing.events.push(event);
      continue;
    }

    sectionMap.set(sectionKey, {
      year: sectionYear,
      events: [event],
    });
  }

  const sections: PlaceChronologySection[] = Array.from(sectionMap.entries()).map(([id, section]) => ({
    id,
    year: section.year,
    groups: groupEventsByStoryRuns(section.events),
  }));

  sections.sort((left, right) => {
    if (left.year === null && right.year === null) {
      return 0;
    }

    if (left.year === null) {
      return 1;
    }

    if (right.year === null) {
      return -1;
    }

    return left.year - right.year;
  });

  return sections;
}