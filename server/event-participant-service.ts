import { Prisma } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import {
  eventParticipantCreateSchema,
  eventParticipantIdSchema,
  eventParticipantUpdateSchema,
} from '@/schemas/event-participant';
// NOTE: Service currently resolves participants of type 'character' only.
// When 'faction' or other types are added, extend ensureParticipantExists and
// mapEventParticipants to dispatch on participantType.

const characterReferenceSelect = {
  id: true,
  name: true,
  slug: true,
} satisfies Prisma.CharacterSelect;

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

const eventReferenceSelect = {
  id: true,
  title: true,
  slug: true,
  eventDateText: true,
  startAt: true,
  endAt: true,
  datePrecision: true,
  place: {
    select: placeReferenceSelect,
  },
  story: {
    select: storyReferenceSelect,
  },
} satisfies Prisma.EventSelect;

const eventParticipantSelect = {
  id: true,
  eventId: true,
  participantType: true,
  participantId: true,
  participantRole: true,
  sequence: true,
  note: true,
  createdAt: true,
  updatedAt: true,
  deletedAt: true,
} satisfies Prisma.EventParticipantSelect;

const characterEventParticipantSelect = {
  ...eventParticipantSelect,
  event: {
    select: eventReferenceSelect,
  },
} satisfies Prisma.EventParticipantSelect;

type EventParticipantRow = Prisma.EventParticipantGetPayload<{ select: typeof eventParticipantSelect }>;
type CharacterEventParticipantRow = Prisma.EventParticipantGetPayload<{ select: typeof characterEventParticipantSelect }>;

type CharacterReference = Prisma.CharacterGetPayload<{ select: typeof characterReferenceSelect }>;

function compareEventParticipantRows(left: EventParticipantRow, right: EventParticipantRow): number {
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

  return left.id.localeCompare(right.id);
}

function resolveNextSequence(participants: Array<Pick<EventParticipantRow, 'sequence'>>): number {
  const highestSequence = participants.reduce((currentHighest, participant) => {
    if (typeof participant.sequence !== 'number') {
      return currentHighest;
    }

    return participant.sequence > currentHighest ? participant.sequence : currentHighest;
  }, 0);

  return highestSequence + 1;
}

export type EventCharacterParticipantRecord = {
  id: string;
  eventId: string;
  participantId: string;
  participantType: string;
  role: string | null;
  sequence: number | null;
  note: string | null;
  createdAt: Date;
  updatedAt: Date;
  character: CharacterReference;
};

export type CharacterEventParticipationRecord = {
  id: string;
  role: string | null;
  sequence: number | null;
  createdAt: Date;
  event: Prisma.EventGetPayload<{ select: typeof eventReferenceSelect }>;
};

function isValidId(id: string): boolean {
  return eventParticipantIdSchema.safeParse({ id }).success;
}

function normalizeRole(value: string | null | undefined): string {
  return value?.trim() ?? '';
}

function toNullableRole(value: string): string | null {
  return value.length > 0 ? value : null;
}

async function ensureEventExists(eventId: string): Promise<void> {
  const event = await prisma.event.findFirst({
    where: { id: eventId, deletedAt: null },
    select: { id: true },
  });

  if (!event) {
    throw new Error('Event not found');
  }
}

async function ensureParticipantExists(participantType: string, participantId: string): Promise<void> {
  if (participantType === 'character') {
    const character = await prisma.character.findFirst({
      where: { id: participantId, deletedAt: null },
      select: { id: true },
    });

    if (!character) {
      throw new Error('Participant not found');
    }

    return;
  }

  throw new Error(`Unsupported participantType: ${participantType}`);
}

async function getCharactersByIds(characterIds: string[]): Promise<Map<string, CharacterReference>> {
  if (characterIds.length === 0) {
    return new Map<string, CharacterReference>();
  }

  const characters = await prisma.character.findMany({
    where: {
      deletedAt: null,
      id: { in: characterIds },
    },
    select: characterReferenceSelect,
  });

  return new Map(characters.map((character) => [character.id, character]));
}

function mapEventParticipants(
  participants: EventParticipantRow[],
  charactersById: Map<string, CharacterReference>
): EventCharacterParticipantRecord[] {
  return participants
    .map((participant) => {
      const character = charactersById.get(participant.participantId);

      if (!character) {
        return null;
      }

      return {
        id: participant.id,
        eventId: participant.eventId,
        participantId: participant.participantId,
        participantType: participant.participantType,
        role: toNullableRole(participant.participantRole),
        sequence: participant.sequence ?? null,
        note: participant.note ?? null,
        createdAt: participant.createdAt,
        updatedAt: participant.updatedAt,
        character,
      };
    })
    .filter((value): value is EventCharacterParticipantRecord => value !== null);
}

export async function listEventParticipants(eventId: string): Promise<EventCharacterParticipantRecord[]> {
  if (!isValidId(eventId)) {
    return [];
  }

  const participants = await prisma.eventParticipant.findMany({
    where: {
      eventId,
      participantType: 'character',
      deletedAt: null,
    },
    orderBy: [{ createdAt: 'asc' }],
    select: eventParticipantSelect,
  });

  const sortedParticipants = [...participants].sort(compareEventParticipantRows);
  const charactersById = await getCharactersByIds(sortedParticipants.map((participant) => participant.participantId));
  return mapEventParticipants(sortedParticipants, charactersById);
}

export async function createEventParticipant(
  eventId: string,
  input: unknown
): Promise<EventCharacterParticipantRecord> {
  if (!isValidId(eventId)) {
    throw new Error('Event not found');
  }

  const parsed = eventParticipantCreateSchema.parse(input);
  await ensureEventExists(eventId);
  await ensureParticipantExists(parsed.participantType, parsed.participantId);

  const role = normalizeRole(parsed.role);
  const existing = await prisma.eventParticipant.findFirst({
    where: {
      eventId,
      participantType: parsed.participantType,
      participantId: parsed.participantId,
      deletedAt: null,
    },
    select: eventParticipantSelect,
  });

  const existingParticipantSequences = await prisma.eventParticipant.findMany({
    where: {
      eventId,
      participantType: parsed.participantType,
      deletedAt: null,
    },
    select: { sequence: true },
  });
  const sequence = parsed.sequence ?? existing?.sequence ?? resolveNextSequence(existingParticipantSequences);

  const participant = existing
    ? await prisma.eventParticipant.update({
        where: { id: existing.id },
        data: {
          participantRole: role,
          sequence,
          status: existing.status === 'archived' ? 'active' : existing.status,
          deletedAt: null,
        },
        select: eventParticipantSelect,
      })
    : await prisma.eventParticipant.create({
        data: {
          eventId,
          participantType: parsed.participantType,
          participantId: parsed.participantId,
          participantRole: role,
          sequence,
          status: 'active',
          canonState: 'canonical',
        },
        select: eventParticipantSelect,
      });

  const charactersById = await getCharactersByIds([participant.participantId]);
  const mapped = mapEventParticipants([participant], charactersById)[0];

  if (!mapped) {
    throw new Error('Participant not found');
  }

  return mapped;
}

export async function updateEventParticipant(
  eventId: string,
  participantId: string,
  input: unknown
): Promise<EventCharacterParticipantRecord | null> {
  if (!isValidId(eventId) || !isValidId(participantId)) {
    return null;
  }

  const existing = await prisma.eventParticipant.findFirst({
    where: {
      id: participantId,
      eventId,
      participantType: 'character',
      deletedAt: null,
    },
    select: eventParticipantSelect,
  });

  if (!existing) {
    return null;
  }

  const parsed = eventParticipantUpdateSchema.parse(input);
  const updated = await prisma.eventParticipant.update({
    where: { id: participantId },
    data: {
      participantRole:
        parsed.role === undefined ? existing.participantRole : normalizeRole(parsed.role),
      sequence: parsed.sequence === undefined ? existing.sequence : parsed.sequence,
    },
    select: eventParticipantSelect,
  });

  const charactersById = await getCharactersByIds([updated.participantId]);
  const mapped = mapEventParticipants([updated], charactersById)[0];
  return mapped ?? null;
}

export async function deleteEventParticipant(
  eventId: string,
  participantId: string
): Promise<EventCharacterParticipantRecord | null> {
  if (!isValidId(eventId) || !isValidId(participantId)) {
    return null;
  }

  const existing = await prisma.eventParticipant.findFirst({
    where: {
      id: participantId,
      eventId,
      participantType: 'character',
      deletedAt: null,
    },
    select: eventParticipantSelect,
  });

  if (!existing) {
    return null;
  }

  const deleted = await prisma.eventParticipant.update({
    where: { id: participantId },
    data: {
      deletedAt: new Date(),
      status: 'archived',
    },
    select: eventParticipantSelect,
  });

  const charactersById = await getCharactersByIds([deleted.participantId]);
  const mapped = mapEventParticipants([deleted], charactersById)[0];
  return mapped ?? null;
}

export async function listCharacterEventParticipations(
  characterId: string
): Promise<CharacterEventParticipationRecord[]> {
  if (!isValidId(characterId)) {
    return [];
  }

  const participants = await prisma.eventParticipant.findMany({
    where: {
      participantType: 'character',
      participantId: characterId,
      deletedAt: null,
      event: { deletedAt: null },
    },
    orderBy: [{ event: { startAt: 'asc' } }, { createdAt: 'asc' }],
    select: characterEventParticipantSelect,
  });

  return participants.map((participant) => ({
    id: participant.id,
    role: toNullableRole(participant.participantRole),
    sequence: participant.sequence ?? null,
    createdAt: participant.createdAt,
    event: participant.event,
  }));
}