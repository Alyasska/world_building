import { Prisma } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import { placeCreateSchema, placeIdSchema, placeUpdateSchema } from '@/schemas/place';
import { resolvePlaceSlug } from './slug';

const placeHierarchyNodeSelect = {
  id: true,
  name: true,
  slug: true,
  placeScale: true,
} satisfies Prisma.PlaceSelect;

const placeListSelect = {
  id: true,
  name: true,
  slug: true,
  summary: true,
  status: true,
  canonState: true,
  placeScale: true,
  placeKind: true,
  parentPlaceId: true,
  parentPlace: {
    select: placeHierarchyNodeSelect,
  },
  childPlaces: {
    where: { deletedAt: null },
    select: placeHierarchyNodeSelect,
    orderBy: { name: 'asc' },
  },
  createdAt: true,
  updatedAt: true,
  deletedAt: true,
} satisfies Prisma.PlaceSelect;

const placeDetailSelect = {
  ...placeListSelect,
  content: true,
  metadata: true,
  locationText: true,
  aliases: true,
  createdAt: true,
  updatedAt: true,
  deletedAt: true,
} satisfies Prisma.PlaceSelect;

export type PlaceHierarchyNode = Prisma.PlaceGetPayload<{ select: typeof placeHierarchyNodeSelect }>;
export type PlaceListRecord = Prisma.PlaceGetPayload<{ select: typeof placeListSelect }>;
type PlaceDetailBaseRecord = Prisma.PlaceGetPayload<{ select: typeof placeDetailSelect }>;
export type PlaceRecord = PlaceDetailBaseRecord & { lineage: PlaceHierarchyNode[] };
export type PlaceParentOption = PlaceHierarchyNode & { parentPlaceId: string | null };

export class PlaceHierarchyError extends Error {}

function isValidPlaceId(id: string): boolean {
  return placeIdSchema.safeParse({ id }).success;
}

async function resolvePlaceLineage(parentPlaceId: string | null): Promise<PlaceHierarchyNode[]> {
  const lineage: PlaceHierarchyNode[] = [];
  let currentParentId = parentPlaceId;

  while (currentParentId) {
    const parent = await prisma.place.findFirst({
      where: { id: currentParentId, deletedAt: null },
      select: {
        ...placeHierarchyNodeSelect,
        parentPlaceId: true,
      },
    });

    if (!parent) {
      break;
    }

    lineage.unshift({
      id: parent.id,
      name: parent.name,
      slug: parent.slug,
      placeScale: parent.placeScale,
    });
    currentParentId = parent.parentPlaceId;
  }

  return lineage;
}

async function ensureParentPlaceExists(parentPlaceId: string): Promise<void> {
  const parent = await prisma.place.findFirst({
    where: { id: parentPlaceId, deletedAt: null },
    select: { id: true },
  });

  if (!parent) {
    throw new PlaceHierarchyError('Parent place not found');
  }
}

async function validatePlaceParent(parentPlaceId: string | null | undefined, currentPlaceId?: string): Promise<void> {
  if (!parentPlaceId) {
    return;
  }

  if (currentPlaceId && parentPlaceId === currentPlaceId) {
    throw new PlaceHierarchyError('A place cannot be its own parent');
  }

  await ensureParentPlaceExists(parentPlaceId);

  if (!currentPlaceId) {
    return;
  }

  let currentParentId: string | null = parentPlaceId;

  while (currentParentId) {
    if (currentParentId === currentPlaceId) {
      throw new PlaceHierarchyError('A place cannot be moved inside its own child hierarchy');
    }

    const nextParent = await prisma.place.findFirst({
      where: { id: currentParentId, deletedAt: null },
      select: { parentPlaceId: true },
    });

    currentParentId = nextParent?.parentPlaceId ?? null;
  }
}

export async function listPlaces(): Promise<PlaceListRecord[]> {
  return prisma.place.findMany({
    where: { deletedAt: null },
    orderBy: [{ placeScale: 'asc' }, { name: 'asc' }],
    select: placeListSelect,
  });
}

export async function listRootPlaces(): Promise<PlaceListRecord[]> {
  return prisma.place.findMany({
    where: { deletedAt: null, parentPlaceId: null },
    orderBy: [{ placeScale: 'asc' }, { name: 'asc' }],
    select: placeListSelect,
  });
}

export async function getPlace(id: string): Promise<PlaceRecord | null> {
  if (!isValidPlaceId(id)) {
    return null;
  }

  const place = await prisma.place.findFirst({
    where: { id, deletedAt: null },
    select: placeDetailSelect,
  });

  if (!place) {
    return null;
  }

  const lineage = await resolvePlaceLineage(place.parentPlaceId);
  return { ...place, lineage };
}

export async function listPlaceParentOptions(excludeId?: string): Promise<PlaceParentOption[]> {
  return prisma.place.findMany({
    where: {
      deletedAt: null,
      ...(excludeId ? { NOT: { id: excludeId } } : {}),
    },
    orderBy: [{ placeScale: 'asc' }, { name: 'asc' }],
    select: {
      ...placeHierarchyNodeSelect,
      parentPlaceId: true,
    },
  });
}

export async function createPlace(input: unknown): Promise<PlaceRecord> {
  const parsed = placeCreateSchema.parse(input);
  await validatePlaceParent(parsed.parentPlaceId);
  const slug = await resolvePlaceSlug(parsed.name, parsed.slug);

  const created = await prisma.place.create({
    data: {
      name: parsed.name,
      slug,
      summary: parsed.summary ?? null,
      content: parsed.content as Prisma.InputJsonValue | Prisma.NullableJsonNullValueInput | undefined,
      status: parsed.status ?? 'draft',
      canonState: parsed.canonState ?? 'canonical',
      metadata: parsed.metadata as Prisma.InputJsonValue | Prisma.NullableJsonNullValueInput | undefined,
      placeScale: parsed.placeScale ?? 'other',
      placeKind: parsed.placeKind ?? null,
      parentPlaceId: parsed.parentPlaceId ?? null,
      locationText: parsed.locationText ?? null,
      aliases: parsed.aliases as Prisma.InputJsonValue | Prisma.NullableJsonNullValueInput | undefined,
    },
    select: placeDetailSelect,
  });

  const lineage = await resolvePlaceLineage(created.parentPlaceId);
  return { ...created, lineage };
}

export async function updatePlace(id: string, input: unknown): Promise<PlaceRecord | null> {
  if (!isValidPlaceId(id)) {
    return null;
  }

  const existing = await prisma.place.findFirst({ where: { id, deletedAt: null } });

  if (!existing) {
    return null;
  }

  const parsed = placeUpdateSchema.parse(input);
  const nextParentPlaceId = parsed.parentPlaceId === undefined ? existing.parentPlaceId : parsed.parentPlaceId;
  await validatePlaceParent(nextParentPlaceId, id);
  const nextSlug = parsed.slug ? await resolvePlaceSlug(parsed.name ?? existing.name, parsed.slug, id) : existing.slug;

  const updated = await prisma.place.update({
    where: { id },
    data: {
      name: parsed.name ?? existing.name,
      slug: nextSlug,
      summary: parsed.summary === undefined ? existing.summary : parsed.summary,
      content: parsed.content === undefined ? existing.content : (parsed.content as Prisma.InputJsonValue | Prisma.NullableJsonNullValueInput),
      status: parsed.status ?? existing.status,
      canonState: parsed.canonState ?? existing.canonState,
      metadata: parsed.metadata === undefined ? existing.metadata : (parsed.metadata as Prisma.InputJsonValue | Prisma.NullableJsonNullValueInput),
      placeScale: parsed.placeScale ?? existing.placeScale,
      placeKind: parsed.placeKind === undefined ? existing.placeKind : parsed.placeKind,
      parentPlaceId: nextParentPlaceId ?? null,
      locationText: parsed.locationText === undefined ? existing.locationText : parsed.locationText,
      aliases: parsed.aliases === undefined ? existing.aliases : (parsed.aliases as Prisma.InputJsonValue | Prisma.NullableJsonNullValueInput),
    },
    select: placeDetailSelect,
  });

  const lineage = await resolvePlaceLineage(updated.parentPlaceId);
  return { ...updated, lineage };
}

export async function deletePlace(id: string): Promise<PlaceRecord | null> {
  if (!isValidPlaceId(id)) {
    return null;
  }

  const existing = await prisma.place.findFirst({ where: { id, deletedAt: null } });

  if (!existing) {
    return null;
  }

  const now = new Date();

  const deleted = await prisma.$transaction(async (tx) => {
    await tx.place.updateMany({
      where: { parentPlaceId: id, deletedAt: null },
      data: { parentPlaceId: null },
    });

    await tx.story.updateMany({
      where: { primaryPlaceId: id, deletedAt: null },
      data: { primaryPlaceId: null },
    });

    await tx.event.updateMany({
      where: { placeId: id, deletedAt: null },
      data: { placeId: null },
    });

    // EntityLink has no FK to Place — clean up orphaned links manually.
    await tx.entityLink.updateMany({
      where: {
        OR: [
          { fromEntityType: 'place', fromEntityId: id },
          { toEntityType: 'place', toEntityId: id },
        ],
        deletedAt: null,
      },
      data: { deletedAt: now, status: 'archived' },
    });

    await tx.entityTag.updateMany({
      where: { entityType: 'place', entityId: id, deletedAt: null },
      data: { deletedAt: now, status: 'archived' },
    });

    // Clear place bindings on map regions — regions stay on the map but become unbound.
    await tx.mapRegion.updateMany({
      where: { placeId: id, deletedAt: null },
      data: { placeId: null },
    });

    return tx.place.update({
      where: { id },
      data: { deletedAt: now, status: 'archived' },
      select: placeDetailSelect,
    });
  });

  const lineage = await resolvePlaceLineage(deleted.parentPlaceId);
  return { ...deleted, lineage };
}
