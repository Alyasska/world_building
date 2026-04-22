import { prisma } from '@/lib/prisma';
import { entityTagCreateSchema, entityTagDeleteSchema, entityTypeSchema } from '@/schemas/link';
import { getCharacter } from './character-service';
import { getPlace } from './place-service';
import { getTag } from './tag-service';

const entityTagSelect = {
  id: true,
  entityType: true,
  entityId: true,
  tagId: true,
  context: true,
  status: true,
  canonState: true,
  metadata: true,
  createdAt: true,
  updatedAt: true,
  deletedAt: true,
  tag: {
    select: {
      id: true,
      name: true,
      slug: true,
      color: true,
      namespace: true,
    },
  },
} as const;

async function entityExists(entityType: string, entityId: string): Promise<boolean> {
  const parsedType = entityTypeSchema.safeParse(entityType);

  if (!parsedType.success) {
    return false;
  }

  if (parsedType.data === 'character') {
    return (await getCharacter(entityId)) !== null;
  }

  return (await getPlace(entityId)) !== null;
}

export async function listEntityTags(entityType?: string, entityId?: string) {
  return prisma.entityTag.findMany({
    where: {
      deletedAt: null,
      tag: { deletedAt: null },
      ...(entityType && entityId ? { entityType, entityId } : {}),
    },
    orderBy: { createdAt: 'desc' },
    select: entityTagSelect,
  });
}

export async function createEntityTag(input: unknown) {
  const parsed = entityTagCreateSchema.parse(input);
  const [entityIsValid, tag] = await Promise.all([
    entityExists(parsed.entityType, parsed.entityId),
    getTag(parsed.tagId),
  ]);

  if (!entityIsValid) {
    throw new Error('Target entity not found');
  }

  if (!tag) {
    throw new Error('Tag not found');
  }

  const existing = await prisma.entityTag.findFirst({
    where: {
      deletedAt: null,
      entityType: parsed.entityType,
      entityId: parsed.entityId,
      tagId: parsed.tagId,
    },
    select: entityTagSelect,
  });

  if (existing) {
    return existing;
  }

  return prisma.entityTag.create({
    data: {
      entityType: parsed.entityType,
      entityId: parsed.entityId,
      tagId: parsed.tagId,
      context: parsed.context ?? null,
      status: parsed.status ?? 'draft',
      canonState: parsed.canonState ?? 'canonical',
      metadata: parsed.metadata,
    },
    select: entityTagSelect,
  });
}

export async function deleteEntityTag(id: string) {
  if (!entityTagDeleteSchema.safeParse({ id }).success) {
    return null;
  }

  const existing = await prisma.entityTag.findFirst({ where: { id, deletedAt: null } });
  if (!existing) return null;

  return prisma.entityTag.update({
    where: { id },
    data: { deletedAt: new Date(), status: 'archived' },
    select: entityTagSelect,
  });
}
