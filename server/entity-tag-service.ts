import { prisma } from '@/lib/prisma';
import { entityTagCreateSchema } from '@/schemas/link';

export async function listEntityTags(entityType?: string, entityId?: string) {
  return prisma.entityTag.findMany({
    where: {
      deletedAt: null,
      ...(entityType && entityId ? { entityType, entityId } : {}),
    },
    orderBy: { createdAt: 'desc' },
    include: { tag: true },
  });
}

export async function createEntityTag(input: unknown) {
  const parsed = entityTagCreateSchema.parse(input);

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
    include: { tag: true },
  });
}

export async function deleteEntityTag(id: string) {
  const existing = await prisma.entityTag.findFirst({ where: { id, deletedAt: null } });
  if (!existing) return null;

  return prisma.entityTag.update({
    where: { id },
    data: { deletedAt: new Date(), status: 'archived' },
    include: { tag: true },
  });
}
