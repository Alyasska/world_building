import { Prisma } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import {
  mapRegionCreateSchema,
  mapRegionIdSchema,
  mapRegionPlaceBindSchema,
  mapRegionUpdateSchema,
} from '@/schemas/map-region';
import { mapIdSchema } from '@/schemas/map';
import { uuidSchema } from '@/schemas/shared';
import { geometrySchemaForType } from '@/lib/map-geometry';
import type { MapGeometryType } from '@/lib/map-geometry';
import { resolveMapRegionSlug } from './slug';
import { toJsonWrite } from '@/lib/prisma-json';

const placeReferenceSelect = {
  id: true,
  name: true,
  slug: true,
  placeScale: true,
} satisfies Prisma.PlaceSelect;

const mapReferenceSelect = {
  id: true,
  name: true,
  slug: true,
} satisfies Prisma.MapSelect;

const mapRegionSelect = {
  id: true,
  name: true,
  slug: true,
  summary: true,
  content: true,
  status: true,
  canonState: true,
  metadata: true,
  mapId: true,
  placeId: true,
  layerKey: true,
  geometryType: true,
  geometry: true,
  labelPoint: true,
  displayOrder: true,
  createdAt: true,
  updatedAt: true,
  deletedAt: true,
  map: { select: mapReferenceSelect },
  place: { select: placeReferenceSelect },
} satisfies Prisma.MapRegionSelect;

export type MapRegionRecord = Prisma.MapRegionGetPayload<{ select: typeof mapRegionSelect }>;

export class MapRegionValidationError extends Error {}

function isValidRegionId(id: string): boolean {
  return mapRegionIdSchema.safeParse({ id }).success;
}

function isValidMapId(id: string): boolean {
  return mapIdSchema.safeParse({ id }).success;
}

async function ensureMapExists(mapId: string): Promise<void> {
  const map = await prisma.map.findFirst({
    where: { id: mapId, deletedAt: null },
    select: { id: true },
  });
  if (!map) throw new MapRegionValidationError('Map not found');
}

async function ensurePlaceExists(placeId: string): Promise<void> {
  const place = await prisma.place.findFirst({
    where: { id: placeId, deletedAt: null },
    select: { id: true },
  });
  if (!place) throw new MapRegionValidationError('Place not found');
}

export async function listMapRegions(mapId: string): Promise<MapRegionRecord[]> {
  if (!isValidMapId(mapId)) return [];
  return prisma.mapRegion.findMany({
    where: { mapId, deletedAt: null },
    orderBy: [{ displayOrder: 'asc' }, { name: 'asc' }],
    select: mapRegionSelect,
  });
}

export async function listRegionsByPlace(placeId: string): Promise<MapRegionRecord[]> {
  if (!uuidSchema.safeParse(placeId).success) return [];
  return prisma.mapRegion.findMany({
    where: { placeId, deletedAt: null },
    orderBy: [{ displayOrder: 'asc' }, { name: 'asc' }],
    select: mapRegionSelect,
  });
}

export async function getMapRegion(id: string): Promise<MapRegionRecord | null> {
  if (!isValidRegionId(id)) return null;
  return prisma.mapRegion.findFirst({
    where: { id, deletedAt: null },
    select: mapRegionSelect,
  });
}

export async function createMapRegion(mapId: string, input: unknown): Promise<MapRegionRecord> {
  if (!isValidMapId(mapId)) throw new MapRegionValidationError('Invalid map id');
  await ensureMapExists(mapId);

  const parsed = mapRegionCreateSchema.parse(input);
  if (parsed.placeId) await ensurePlaceExists(parsed.placeId);

  const slug = await resolveMapRegionSlug(parsed.name, parsed.slug);

  return prisma.mapRegion.create({
    data: {
      name: parsed.name,
      slug,
      summary: parsed.summary ?? null,
      content: parsed.content as Prisma.InputJsonValue | Prisma.NullableJsonNullValueInput | undefined,
      status: parsed.status ?? 'draft',
      canonState: parsed.canonState ?? 'canonical',
      metadata: parsed.metadata as Prisma.InputJsonValue | undefined,
      mapId,
      placeId: parsed.placeId ?? null,
      layerKey: parsed.layerKey ?? 'base',
      geometryType: parsed.geometryType,
      geometry: parsed.geometry as Prisma.InputJsonValue,
      labelPoint: parsed.labelPoint as Prisma.InputJsonValue | Prisma.NullableJsonNullValueInput | undefined,
      displayOrder: parsed.displayOrder ?? 0,
    },
    select: mapRegionSelect,
  });
}

export async function updateMapRegion(id: string, input: unknown): Promise<MapRegionRecord | null> {
  if (!isValidRegionId(id)) return null;

  const existing = await prisma.mapRegion.findFirst({ where: { id, deletedAt: null } });
  if (!existing) return null;

  const parsed = mapRegionUpdateSchema.parse(input);

  if (parsed.placeId !== undefined && parsed.placeId !== null) {
    await ensurePlaceExists(parsed.placeId);
  }

  // When only geometry changes (no geometryType in update body), validate the
  // new geometry against the existing record's type.
  if (parsed.geometry !== undefined && parsed.geometryType === undefined) {
    const schema = geometrySchemaForType(existing.geometryType as MapGeometryType);
    schema.parse(parsed.geometry);
  }

  const nextSlug = parsed.slug
    ? await resolveMapRegionSlug(parsed.name ?? existing.name, parsed.slug, id)
    : existing.slug;

  await prisma.mapRegion.update({
    where: { id },
    data: {
      name: parsed.name ?? existing.name,
      slug: nextSlug,
      summary: parsed.summary === undefined ? existing.summary : parsed.summary,
      content: parsed.content === undefined
        ? toJsonWrite(existing.content)
        : (parsed.content as Prisma.InputJsonValue | Prisma.NullableJsonNullValueInput),
      status: parsed.status ?? existing.status,
      canonState: parsed.canonState ?? existing.canonState,
      metadata: parsed.metadata === undefined
        ? toJsonWrite(existing.metadata)
        : (parsed.metadata as Prisma.InputJsonValue | undefined),
      placeId: parsed.placeId === undefined ? existing.placeId : parsed.placeId,
      layerKey: parsed.layerKey ?? existing.layerKey,
      geometryType: parsed.geometryType ?? existing.geometryType,
      geometry: parsed.geometry === undefined
        ? (existing.geometry as Prisma.InputJsonValue)
        : (parsed.geometry as Prisma.InputJsonValue),
      labelPoint: parsed.labelPoint === undefined
        ? toJsonWrite(existing.labelPoint)
        : (parsed.labelPoint as Prisma.InputJsonValue | Prisma.NullableJsonNullValueInput),
      displayOrder: parsed.displayOrder ?? existing.displayOrder,
    },
  });

  return getMapRegion(id);
}

export async function deleteMapRegion(id: string): Promise<MapRegionRecord | null> {
  if (!isValidRegionId(id)) return null;

  const existing = await prisma.mapRegion.findFirst({ where: { id, deletedAt: null } });
  if (!existing) return null;

  return prisma.mapRegion.update({
    where: { id },
    data: { deletedAt: new Date(), status: 'archived' },
    select: mapRegionSelect,
  });
}

export async function bindRegionToPlace(
  regionId: string,
  input: unknown,
): Promise<MapRegionRecord | null> {
  if (!isValidRegionId(regionId)) return null;

  const existing = await prisma.mapRegion.findFirst({ where: { id: regionId, deletedAt: null } });
  if (!existing) return null;

  const { placeId } = mapRegionPlaceBindSchema.parse(input);
  await ensurePlaceExists(placeId);

  return prisma.mapRegion.update({
    where: { id: regionId },
    data: { placeId },
    select: mapRegionSelect,
  });
}

export async function unbindRegionFromPlace(regionId: string): Promise<MapRegionRecord | null> {
  if (!isValidRegionId(regionId)) return null;

  const existing = await prisma.mapRegion.findFirst({ where: { id: regionId, deletedAt: null } });
  if (!existing) return null;

  return prisma.mapRegion.update({
    where: { id: regionId },
    data: { placeId: null },
    select: mapRegionSelect,
  });
}
