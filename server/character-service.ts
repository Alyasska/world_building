import { Prisma } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import { characterCreateSchema, characterIdSchema, characterUpdateSchema } from '@/schemas/character';
import { resolveCharacterSlug } from './slug';

const characterSelect = {
  id: true,
  name: true,
  slug: true,
  summary: true,
  content: true,
  status: true,
  canonState: true,
  metadata: true,
  aliases: true,
  pronouns: true,
  epithet: true,
  birthDateText: true,
  deathDateText: true,
  createdAt: true,
  updatedAt: true,
  deletedAt: true,
} satisfies Prisma.CharacterSelect;

export type CharacterRecord = Prisma.CharacterGetPayload<{ select: typeof characterSelect }>;

function isValidCharacterId(id: string): boolean {
  return characterIdSchema.safeParse({ id }).success;
}

export async function listCharacters(): Promise<CharacterRecord[]> {
  return prisma.character.findMany({
    where: { deletedAt: null },
    orderBy: { createdAt: 'desc' },
    select: characterSelect,
  });
}

export async function getCharacter(id: string): Promise<CharacterRecord | null> {
  if (!isValidCharacterId(id)) {
    return null;
  }

  return prisma.character.findFirst({
    where: { id, deletedAt: null },
    select: characterSelect,
  });
}

export async function createCharacter(input: unknown): Promise<CharacterRecord> {
  const parsed = characterCreateSchema.parse(input);
  const slug = await resolveCharacterSlug(parsed.name, parsed.slug);

  return prisma.character.create({
    data: {
      name: parsed.name,
      slug,
      summary: parsed.summary ?? null,
      content: parsed.content as Prisma.InputJsonValue | Prisma.NullableJsonNullValueInput | undefined,
      status: parsed.status ?? 'draft',
      canonState: parsed.canonState ?? 'canonical',
      metadata: parsed.metadata as Prisma.InputJsonValue | Prisma.NullableJsonNullValueInput | undefined,
      aliases: parsed.aliases as Prisma.InputJsonValue | Prisma.NullableJsonNullValueInput | undefined,
      pronouns: parsed.pronouns ?? null,
      epithet: parsed.epithet ?? null,
      birthDateText: parsed.birthDateText ?? null,
      deathDateText: parsed.deathDateText ?? null,
    },
    select: characterSelect,
  });
}

export async function updateCharacter(id: string, input: unknown): Promise<CharacterRecord | null> {
  if (!isValidCharacterId(id)) {
    return null;
  }

  const existing = await prisma.character.findFirst({ where: { id, deletedAt: null } });

  if (!existing) {
    return null;
  }

  const parsed = characterUpdateSchema.parse(input);
  const nextSlug = parsed.slug ? await resolveCharacterSlug(parsed.name ?? existing.name, parsed.slug, id) : existing.slug;

  return prisma.character.update({
    where: { id },
    data: {
      name: parsed.name ?? existing.name,
      slug: nextSlug,
      summary: parsed.summary === undefined ? existing.summary : parsed.summary,
      content: parsed.content === undefined ? existing.content : (parsed.content as Prisma.InputJsonValue | Prisma.NullableJsonNullValueInput),
      status: parsed.status ?? existing.status,
      canonState: parsed.canonState ?? existing.canonState,
      metadata: parsed.metadata === undefined ? existing.metadata : (parsed.metadata as Prisma.InputJsonValue | Prisma.NullableJsonNullValueInput),
      aliases: parsed.aliases === undefined ? existing.aliases : (parsed.aliases as Prisma.InputJsonValue | Prisma.NullableJsonNullValueInput),
      pronouns: parsed.pronouns === undefined ? existing.pronouns : parsed.pronouns,
      epithet: parsed.epithet === undefined ? existing.epithet : parsed.epithet,
      birthDateText: parsed.birthDateText === undefined ? existing.birthDateText : parsed.birthDateText,
      deathDateText: parsed.deathDateText === undefined ? existing.deathDateText : parsed.deathDateText,
    },
    select: characterSelect,
  });
}

export async function deleteCharacter(id: string): Promise<CharacterRecord | null> {
  if (!isValidCharacterId(id)) {
    return null;
  }

  const existing = await prisma.character.findFirst({ where: { id, deletedAt: null } });

  if (!existing) {
    return null;
  }

  const now = new Date();

  return prisma.$transaction(async (tx) => {
    // CharacterRelation uses onDelete:Restrict — must soft-delete before the character row.
    await tx.characterRelation.updateMany({
      where: {
        OR: [{ fromCharacterId: id }, { toCharacterId: id }],
        deletedAt: null,
      },
      data: { deletedAt: now, status: 'archived' },
    });

    await tx.eventParticipant.updateMany({
      where: { participantType: 'character', participantId: id, deletedAt: null },
      data: { deletedAt: now, status: 'archived' },
    });

    // EntityLink has no FK to Character — clean up orphaned links manually.
    await tx.entityLink.updateMany({
      where: {
        OR: [
          { fromEntityType: 'character', fromEntityId: id },
          { toEntityType: 'character', toEntityId: id },
        ],
        deletedAt: null,
      },
      data: { deletedAt: now, status: 'archived' },
    });

    await tx.entityTag.updateMany({
      where: { entityType: 'character', entityId: id, deletedAt: null },
      data: { deletedAt: now, status: 'archived' },
    });

    return tx.character.update({
      where: { id },
      data: { deletedAt: now, status: 'archived' },
      select: characterSelect,
    });
  });
}
