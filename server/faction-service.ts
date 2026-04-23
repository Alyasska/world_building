import { Prisma } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import { factionCreateSchema, factionIdSchema, factionUpdateSchema } from '@/schemas/faction';
import { resolveFactionSlug } from './slug';
import { toJsonWrite } from '@/lib/prisma-json';

const factionSelect = {
  id: true,
  name: true,
  slug: true,
  summary: true,
  content: true,
  status: true,
  canonState: true,
  metadata: true,
  factionKind: true,
  createdAt: true,
  updatedAt: true,
  deletedAt: true,
} satisfies Prisma.FactionSelect;

export type FactionRecord = Prisma.FactionGetPayload<{ select: typeof factionSelect }>;

function isValidFactionId(id: string): boolean {
  return factionIdSchema.safeParse({ id }).success;
}

export async function listFactions(): Promise<FactionRecord[]> {
  return prisma.faction.findMany({
    where: { deletedAt: null },
    orderBy: { createdAt: 'desc' },
    select: factionSelect,
  });
}

export async function getFaction(id: string): Promise<FactionRecord | null> {
  if (!isValidFactionId(id)) {
    return null;
  }

  return prisma.faction.findFirst({
    where: { id, deletedAt: null },
    select: factionSelect,
  });
}

export async function createFaction(input: unknown): Promise<FactionRecord> {
  const parsed = factionCreateSchema.parse(input);
  const slug = await resolveFactionSlug(parsed.name, parsed.slug);

  return prisma.faction.create({
    data: {
      name: parsed.name,
      slug,
      summary: parsed.summary ?? null,
      content: parsed.content as Prisma.InputJsonValue | Prisma.NullableJsonNullValueInput | undefined,
      status: parsed.status ?? 'draft',
      canonState: parsed.canonState ?? 'canonical',
      metadata: parsed.metadata as Prisma.InputJsonValue | Prisma.NullableJsonNullValueInput | undefined,
      factionKind: parsed.factionKind ?? null,
    },
    select: factionSelect,
  });
}

export async function updateFaction(id: string, input: unknown): Promise<FactionRecord | null> {
  if (!isValidFactionId(id)) {
    return null;
  }

  const existing = await prisma.faction.findFirst({ where: { id, deletedAt: null } });

  if (!existing) {
    return null;
  }

  const parsed = factionUpdateSchema.parse(input);
  const nextSlug = parsed.slug ? await resolveFactionSlug(parsed.name ?? existing.name, parsed.slug, id) : existing.slug;

  return prisma.faction.update({
    where: { id },
    data: {
      name: parsed.name ?? existing.name,
      slug: nextSlug,
      summary: parsed.summary === undefined ? existing.summary : parsed.summary,
      content: parsed.content === undefined ? toJsonWrite(existing.content) : (parsed.content as Prisma.InputJsonValue | Prisma.NullableJsonNullValueInput),
      status: parsed.status ?? existing.status,
      canonState: parsed.canonState ?? existing.canonState,
      metadata: parsed.metadata === undefined ? toJsonWrite(existing.metadata) : (parsed.metadata as Prisma.InputJsonValue | Prisma.NullableJsonNullValueInput),
      factionKind: parsed.factionKind === undefined ? existing.factionKind : parsed.factionKind,
    },
    select: factionSelect,
  });
}

export async function deleteFaction(id: string): Promise<FactionRecord | null> {
  if (!isValidFactionId(id)) {
    return null;
  }

  const existing = await prisma.faction.findFirst({ where: { id, deletedAt: null } });

  if (!existing) {
    return null;
  }

  const now = new Date();

  return prisma.$transaction(async (tx) => {
    await tx.entityLink.updateMany({
      where: {
        OR: [
          { fromEntityType: 'faction', fromEntityId: id },
          { toEntityType: 'faction', toEntityId: id },
        ],
        deletedAt: null,
      },
      data: { deletedAt: now, status: 'archived' },
    });

    await tx.entityTag.updateMany({
      where: { entityType: 'faction', entityId: id, deletedAt: null },
      data: { deletedAt: now, status: 'archived' },
    });

    return tx.faction.update({
      where: { id },
      data: { deletedAt: now, status: 'archived' },
      select: factionSelect,
    });
  });
}
