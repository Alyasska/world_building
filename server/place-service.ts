import { Prisma } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import { placeCreateSchema, placeUpdateSchema } from '@/schemas/place';
import { resolvePlaceSlug } from './slug';

const placeSelect = {
  id: true,
  name: true,
  slug: true,
  summary: true,
  content: true,
  status: true,
  canonState: true,
  metadata: true,
  placeKind: true,
  locationText: true,
  aliases: true,
  createdAt: true,
  updatedAt: true,
  deletedAt: true,
} satisfies Prisma.PlaceSelect;

export type PlaceRecord = Prisma.PlaceGetPayload<{ select: typeof placeSelect }>;

export async function listPlaces(): Promise<PlaceRecord[]> {
  return prisma.place.findMany({
    where: { deletedAt: null },
    orderBy: { createdAt: 'desc' },
    select: placeSelect,
  });
}

export async function getPlace(id: string): Promise<PlaceRecord | null> {
  return prisma.place.findFirst({
    where: { id, deletedAt: null },
    select: placeSelect,
  });
}

export async function createPlace(input: unknown): Promise<PlaceRecord> {
  const parsed = placeCreateSchema.parse(input);
  const slug = await resolvePlaceSlug(parsed.name, parsed.slug);

  return prisma.place.create({
    data: {
      name: parsed.name,
      slug,
      summary: parsed.summary ?? null,
      content: parsed.content as Prisma.InputJsonValue | Prisma.NullableJsonNullValueInput | undefined,
      status: parsed.status ?? 'draft',
      canonState: parsed.canonState ?? 'canonical',
      metadata: parsed.metadata as Prisma.InputJsonValue | Prisma.NullableJsonNullValueInput | undefined,
      placeKind: parsed.placeKind ?? null,
      locationText: parsed.locationText ?? null,
      aliases: parsed.aliases as Prisma.InputJsonValue | Prisma.NullableJsonNullValueInput | undefined,
    },
    select: placeSelect,
  });
}

export async function updatePlace(id: string, input: unknown): Promise<PlaceRecord | null> {
  const existing = await prisma.place.findFirst({ where: { id, deletedAt: null } });

  if (!existing) {
    return null;
  }

  const parsed = placeUpdateSchema.parse(input);
  const nextSlug = parsed.slug ? await resolvePlaceSlug(parsed.name ?? existing.name, parsed.slug, id) : existing.slug;

  return prisma.place.update({
    where: { id },
    data: {
      name: parsed.name ?? existing.name,
      slug: nextSlug,
      summary: parsed.summary === undefined ? existing.summary : parsed.summary,
      content: parsed.content === undefined ? existing.content : (parsed.content as Prisma.InputJsonValue | Prisma.NullableJsonNullValueInput),
      status: parsed.status ?? existing.status,
      canonState: parsed.canonState ?? existing.canonState,
      metadata: parsed.metadata === undefined ? existing.metadata : (parsed.metadata as Prisma.InputJsonValue | Prisma.NullableJsonNullValueInput),
      placeKind: parsed.placeKind === undefined ? existing.placeKind : parsed.placeKind,
      locationText: parsed.locationText === undefined ? existing.locationText : parsed.locationText,
      aliases: parsed.aliases === undefined ? existing.aliases : (parsed.aliases as Prisma.InputJsonValue | Prisma.NullableJsonNullValueInput),
    },
    select: placeSelect,
  });
}

export async function deletePlace(id: string): Promise<PlaceRecord | null> {
  const existing = await prisma.place.findFirst({ where: { id, deletedAt: null } });

  if (!existing) {
    return null;
  }

  return prisma.place.update({
    where: { id },
    data: { deletedAt: new Date(), status: 'archived' },
    select: placeSelect,
  });
}
