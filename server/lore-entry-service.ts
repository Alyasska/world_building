import { Prisma } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import { loreEntryCreateSchema, loreEntryIdSchema, loreEntryUpdateSchema } from '@/schemas/lore-entry';
import { resolveLoreEntrySlug } from './slug';
import { toJsonWrite } from '@/lib/prisma-json';

const loreEntrySelect = {
  id: true,
  title: true,
  slug: true,
  summary: true,
  content: true,
  status: true,
  canonState: true,
  metadata: true,
  entryKind: true,
  topic: true,
  createdAt: true,
  updatedAt: true,
  deletedAt: true,
} satisfies Prisma.LoreEntrySelect;

export type LoreEntryRecord = Prisma.LoreEntryGetPayload<{ select: typeof loreEntrySelect }>;

function isValidId(id: string): boolean {
  return loreEntryIdSchema.safeParse({ id }).success;
}

export async function listLoreEntries(): Promise<LoreEntryRecord[]> {
  return prisma.loreEntry.findMany({
    where: { deletedAt: null },
    orderBy: { createdAt: 'desc' },
    select: loreEntrySelect,
  });
}

export async function getLoreEntry(id: string): Promise<LoreEntryRecord | null> {
  if (!isValidId(id)) return null;
  return prisma.loreEntry.findFirst({ where: { id, deletedAt: null }, select: loreEntrySelect });
}

export async function createLoreEntry(input: unknown): Promise<LoreEntryRecord> {
  const parsed = loreEntryCreateSchema.parse(input);
  const slug = await resolveLoreEntrySlug(parsed.title, parsed.slug);

  return prisma.loreEntry.create({
    data: {
      title: parsed.title,
      slug,
      summary: parsed.summary ?? null,
      content: parsed.content as Prisma.InputJsonValue | Prisma.NullableJsonNullValueInput | undefined,
      status: parsed.status ?? 'draft',
      canonState: parsed.canonState ?? 'canonical',
      metadata: parsed.metadata as Prisma.InputJsonValue | Prisma.NullableJsonNullValueInput | undefined,
      entryKind: parsed.entryKind ?? null,
      topic: parsed.topic ?? null,
    },
    select: loreEntrySelect,
  });
}

export async function updateLoreEntry(id: string, input: unknown): Promise<LoreEntryRecord | null> {
  if (!isValidId(id)) return null;

  const existing = await prisma.loreEntry.findFirst({ where: { id, deletedAt: null } });
  if (!existing) return null;

  const parsed = loreEntryUpdateSchema.parse(input);
  const nextSlug = parsed.slug ? await resolveLoreEntrySlug(parsed.title ?? existing.title, parsed.slug, id) : existing.slug;

  return prisma.loreEntry.update({
    where: { id },
    data: {
      title: parsed.title ?? existing.title,
      slug: nextSlug,
      summary: parsed.summary === undefined ? existing.summary : parsed.summary,
      content: parsed.content === undefined ? toJsonWrite(existing.content) : (parsed.content as Prisma.InputJsonValue | Prisma.NullableJsonNullValueInput),
      status: parsed.status ?? existing.status,
      canonState: parsed.canonState ?? existing.canonState,
      metadata: parsed.metadata === undefined ? toJsonWrite(existing.metadata) : (parsed.metadata as Prisma.InputJsonValue | Prisma.NullableJsonNullValueInput),
      entryKind: parsed.entryKind === undefined ? existing.entryKind : parsed.entryKind,
      topic: parsed.topic === undefined ? existing.topic : parsed.topic,
    },
    select: loreEntrySelect,
  });
}

export async function deleteLoreEntry(id: string): Promise<LoreEntryRecord | null> {
  if (!isValidId(id)) return null;

  const existing = await prisma.loreEntry.findFirst({ where: { id, deletedAt: null } });
  if (!existing) return null;

  const now = new Date();

  return prisma.$transaction(async (tx) => {
    await tx.entityLink.updateMany({
      where: {
        OR: [
          { fromEntityType: 'lore-entry', fromEntityId: id },
          { toEntityType: 'lore-entry', toEntityId: id },
        ],
        deletedAt: null,
      },
      data: { deletedAt: now, status: 'archived' },
    });

    await tx.entityTag.updateMany({
      where: { entityType: 'lore-entry', entityId: id, deletedAt: null },
      data: { deletedAt: now, status: 'archived' },
    });

    return tx.loreEntry.update({
      where: { id },
      data: { deletedAt: now, status: 'archived' },
      select: loreEntrySelect,
    });
  });
}
