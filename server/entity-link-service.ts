import { prisma } from '@/lib/prisma';
import { entityLinkCreateSchema } from '@/schemas/link';

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
  });
}

export async function createEntityLink(input: unknown) {
  const parsed = entityLinkCreateSchema.parse(input);

  return prisma.entityLink.create({
    data: {
      fromEntityType: parsed.sourceEntityType,
      fromEntityId: parsed.sourceEntityId,
      toEntityType: parsed.targetEntityType,
      toEntityId: parsed.targetEntityId,
      relationType: parsed.relationType,
      isBidirectional: parsed.isBidirectional ?? false,
      status: parsed.status ?? 'draft',
      canonState: parsed.canonState ?? 'canonical',
      metadata: parsed.metadata,
    },
  });
}

export async function deleteEntityLink(id: string) {
  const existing = await prisma.entityLink.findFirst({ where: { id, deletedAt: null } });
  if (!existing) return null;

  return prisma.entityLink.update({
    where: { id },
    data: { deletedAt: new Date(), status: 'archived' },
  });
}
