import { prisma } from '@/lib/prisma';
import { entityLinkCreateSchema, entityLinkDeleteSchema, entityTypeSchema } from '@/schemas/link';
import { getCharacter } from './character-service';
import { getPlace } from './place-service';

const entityLinkSelect = {
  id: true,
  fromEntityType: true,
  fromEntityId: true,
  toEntityType: true,
  toEntityId: true,
  relationType: true,
  isBidirectional: true,
  status: true,
  canonState: true,
  metadata: true,
  createdAt: true,
  updatedAt: true,
  deletedAt: true,
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

export async function listEntityLinks(entityType?: string, entityId?: string) {
  return prisma.entityLink.findMany({
    where: {
      deletedAt: null,
      ...(entityType && entityId
        ? {
            OR: [
              { fromEntityType: entityType, fromEntityId: entityId },
              { toEntityType: entityType, toEntityId: entityId },
            ],
          }
        : {}),
    },
    orderBy: { createdAt: 'desc' },
    select: entityLinkSelect,
  });
}

export async function createEntityLink(input: unknown) {
  const parsed = entityLinkCreateSchema.parse(input);
  const sourceType = parsed.sourceEntityType;
  const targetType = parsed.targetEntityType;

  if (sourceType === targetType) {
    throw new Error('Source and target entity types must be different');
  }

  const [sourceExists, targetExists] = await Promise.all([
    entityExists(sourceType, parsed.sourceEntityId),
    entityExists(targetType, parsed.targetEntityId),
  ]);

  if (!sourceExists || !targetExists) {
    throw new Error('Target entity not found');
  }

  const normalizedRelationType = parsed.relationType.trim();

  const existing = await prisma.entityLink.findFirst({
    where: {
      deletedAt: null,
      relationType: normalizedRelationType,
      OR: [
        {
          fromEntityType: sourceType,
          fromEntityId: parsed.sourceEntityId,
          toEntityType: targetType,
          toEntityId: parsed.targetEntityId,
        },
        {
          fromEntityType: targetType,
          fromEntityId: parsed.targetEntityId,
          toEntityType: sourceType,
          toEntityId: parsed.sourceEntityId,
          isBidirectional: true,
        },
      ],
    },
    select: entityLinkSelect,
  });

  if (existing) {
    return existing;
  }

  return prisma.entityLink.create({
    data: {
      fromEntityType: sourceType,
      fromEntityId: parsed.sourceEntityId,
      toEntityType: targetType,
      toEntityId: parsed.targetEntityId,
      relationType: normalizedRelationType,
      isBidirectional: parsed.isBidirectional ?? true,
      status: parsed.status ?? 'active',
      canonState: parsed.canonState ?? 'canonical',
      metadata: parsed.metadata,
    },
    select: entityLinkSelect,
  });
}

export async function deleteEntityLink(id: string) {
  if (!entityLinkDeleteSchema.safeParse({ id }).success) {
    return null;
  }

  const existing = await prisma.entityLink.findFirst({ where: { id, deletedAt: null } });
  if (!existing) return null;

  return prisma.entityLink.update({
    where: { id },
    data: { deletedAt: new Date(), status: 'archived' },
    select: entityLinkSelect,
  });
}
