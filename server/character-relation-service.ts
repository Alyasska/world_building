import { prisma } from '@/lib/prisma';
import { characterRelationCreateSchema, characterRelationIdSchema } from '@/schemas/character-relation';

const relationSelect = {
  id: true,
  fromCharacterId: true,
  toCharacterId: true,
  relationType: true,
  status: true,
  createdAt: true,
  fromCharacter: { select: { id: true, name: true } },
  toCharacter: { select: { id: true, name: true } },
} as const;

export type CharacterRelationRecord = {
  id: string;
  fromCharacterId: string;
  toCharacterId: string;
  relationType: string;
  status: string;
  createdAt: Date;
  fromCharacter: { id: string; name: string };
  toCharacter: { id: string; name: string };
};

export async function listCharacterRelations(characterId: string): Promise<CharacterRelationRecord[]> {
  return prisma.characterRelation.findMany({
    where: {
      deletedAt: null,
      OR: [{ fromCharacterId: characterId }, { toCharacterId: characterId }],
    },
    orderBy: { createdAt: 'desc' },
    select: relationSelect,
  }) as Promise<CharacterRelationRecord[]>;
}

export async function createCharacterRelation(input: unknown): Promise<CharacterRelationRecord> {
  const parsed = characterRelationCreateSchema.parse(input);

  if (parsed.fromCharacterId === parsed.toCharacterId) {
    throw new Error('A character cannot relate to itself');
  }

  return prisma.characterRelation.create({
    data: {
      fromCharacterId: parsed.fromCharacterId,
      toCharacterId: parsed.toCharacterId,
      relationType: parsed.relationType,
      status: 'active',
      canonState: 'canonical',
    },
    select: relationSelect,
  }) as Promise<CharacterRelationRecord>;
}

export async function deleteCharacterRelation(id: string): Promise<CharacterRelationRecord | null> {
  if (!characterRelationIdSchema.safeParse({ id }).success) return null;
  const existing = await prisma.characterRelation.findFirst({ where: { id, deletedAt: null } });
  if (!existing) return null;

  return prisma.characterRelation.update({
    where: { id },
    data: { deletedAt: new Date(), status: 'archived' },
    select: relationSelect,
  }) as Promise<CharacterRelationRecord>;
}
