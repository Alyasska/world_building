import { Prisma } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import { mapCreateSchema, mapIdSchema, mapUpdateSchema } from '@/schemas/map';
import { resolveMapSlug } from './slug';

const mapListSelect = {
  id: true,
  name: true,
  slug: true,
  summary: true,
  status: true,
  canonState: true,
  mapKind: true,
  defaultLayerKey: true,
  createdAt: true,
  updatedAt: true,
  deletedAt: true,
} satisfies Prisma.MapSelect;

const mapDetailSelect = {
  ...mapListSelect,
  content: true,
  metadata: true,
} satisfies Prisma.MapSelect;

export type MapListRecord = Prisma.MapGetPayload<{ select: typeof mapListSelect }>;
export type MapRecord = Prisma.MapGetPayload<{ select: typeof mapDetailSelect }>;

function isValidMapId(id: string): boolean {
  return mapIdSchema.safeParse({ id }).success;
}

export async function listMaps(): Promise<MapListRecord[]> {
  return prisma.map.findMany({
    where: { deletedAt: null },
    orderBy: [{ name: 'asc' }],
    select: mapListSelect,
  });
}

export async function getMap(id: string): Promise<MapRecord | null> {
  if (!isValidMapId(id)) return null;
  return prisma.map.findFirst({
    where: { id, deletedAt: null },
    select: mapDetailSelect,
  });
}

export async function createMap(input: unknown): Promise<MapRecord> {
  const parsed = mapCreateSchema.parse(input);
  const slug = await resolveMapSlug(parsed.name, parsed.slug);

  return prisma.map.create({
    data: {
      name: parsed.name,
      slug,
      summary: parsed.summary ?? null,
      content: parsed.content as Prisma.InputJsonValue | Prisma.NullableJsonNullValueInput | undefined,
      status: parsed.status ?? 'draft',
      canonState: parsed.canonState ?? 'canonical',
      metadata: parsed.metadata as Prisma.InputJsonValue | undefined,
      mapKind: parsed.mapKind ?? null,
      defaultLayerKey: parsed.defaultLayerKey ?? 'base',
    },
    select: mapDetailSelect,
  });
}

export async function updateMap(id: string, input: unknown): Promise<MapRecord | null> {
  if (!isValidMapId(id)) return null;

  const existing = await prisma.map.findFirst({ where: { id, deletedAt: null } });
  if (!existing) return null;

  const parsed = mapUpdateSchema.parse(input);
  const nextSlug = parsed.slug
    ? await resolveMapSlug(parsed.name ?? existing.name, parsed.slug, id)
    : existing.slug;

  return prisma.map.update({
    where: { id },
    data: {
      name: parsed.name ?? existing.name,
      slug: nextSlug,
      summary: parsed.summary === undefined ? existing.summary : parsed.summary,
      content: parsed.content === undefined
        ? existing.content
        : (parsed.content as Prisma.InputJsonValue | Prisma.NullableJsonNullValueInput),
      status: parsed.status ?? existing.status,
      canonState: parsed.canonState ?? existing.canonState,
      metadata: parsed.metadata === undefined
        ? existing.metadata
        : (parsed.metadata as Prisma.InputJsonValue | undefined),
      mapKind: parsed.mapKind === undefined ? existing.mapKind : parsed.mapKind,
      defaultLayerKey: parsed.defaultLayerKey ?? existing.defaultLayerKey,
    },
    select: mapDetailSelect,
  });
}

export async function deleteMap(id: string): Promise<MapRecord | null> {
  if (!isValidMapId(id)) return null;

  const existing = await prisma.map.findFirst({ where: { id, deletedAt: null } });
  if (!existing) return null;

  const now = new Date();

  return prisma.$transaction(async (tx) => {
    // Soft-delete all regions on this map before archiving the map itself.
    await tx.mapRegion.updateMany({
      where: { mapId: id, deletedAt: null },
      data: { deletedAt: now, status: 'archived' },
    });

    return tx.map.update({
      where: { id },
      data: { deletedAt: now, status: 'archived' },
      select: mapDetailSelect,
    });
  });
}
