import { prisma } from '@/lib/prisma';
import { storyEntityCreateSchema, storyEntityIdSchema } from '@/schemas/story-entity';

const storyEntitySelect = {
  id: true,
  storyId: true,
  entityType: true,
  entityId: true,
  entityRole: true,
  sequence: true,
  note: true,
  status: true,
  createdAt: true,
} as const;

export type StoryEntityRecord = {
  id: string;
  storyId: string;
  entityType: string;
  entityId: string;
  entityRole: string;
  sequence: number | null;
  note: string | null;
  status: string;
  createdAt: Date;
};

export async function listStoryEntities(storyId: string): Promise<StoryEntityRecord[]> {
  return prisma.storyEntity.findMany({
    where: { storyId, deletedAt: null },
    orderBy: [{ sequence: 'asc' }, { createdAt: 'asc' }],
    select: storyEntitySelect,
  }) as Promise<StoryEntityRecord[]>;
}

export async function createStoryEntity(input: unknown): Promise<StoryEntityRecord> {
  const parsed = storyEntityCreateSchema.parse(input);

  return prisma.storyEntity.create({
    data: {
      storyId: parsed.storyId,
      entityType: parsed.entityType,
      entityId: parsed.entityId,
      entityRole: parsed.entityRole,
      sequence: parsed.sequence ?? null,
      note: parsed.note ?? null,
      status: 'active',
      canonState: 'canonical',
    },
    select: storyEntitySelect,
  }) as Promise<StoryEntityRecord>;
}

export async function deleteStoryEntity(id: string): Promise<StoryEntityRecord | null> {
  if (!storyEntityIdSchema.safeParse({ id }).success) return null;
  const existing = await prisma.storyEntity.findFirst({ where: { id, deletedAt: null } });
  if (!existing) return null;

  return prisma.storyEntity.update({
    where: { id },
    data: { deletedAt: new Date(), status: 'archived' },
    select: storyEntitySelect,
  }) as Promise<StoryEntityRecord>;
}
