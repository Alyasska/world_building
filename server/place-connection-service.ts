import { prisma } from '@/lib/prisma';
import { placeConnectionCreateSchema, placeConnectionIdSchema } from '@/schemas/place-connection';

const connectionSelect = {
  id: true,
  fromPlaceId: true,
  toPlaceId: true,
  connectionType: true,
  isBidirectional: true,
  travelTimeText: true,
  status: true,
  createdAt: true,
  fromPlace: { select: { id: true, name: true } },
  toPlace: { select: { id: true, name: true } },
} as const;

export type PlaceConnectionRecord = {
  id: string;
  fromPlaceId: string;
  toPlaceId: string;
  connectionType: string;
  isBidirectional: boolean;
  travelTimeText: string | null;
  status: string;
  createdAt: Date;
  fromPlace: { id: string; name: string };
  toPlace: { id: string; name: string };
};

export async function listPlaceConnections(placeId: string): Promise<PlaceConnectionRecord[]> {
  return prisma.placeConnection.findMany({
    where: {
      deletedAt: null,
      OR: [{ fromPlaceId: placeId }, { toPlaceId: placeId }],
    },
    orderBy: { createdAt: 'desc' },
    select: connectionSelect,
  }) as Promise<PlaceConnectionRecord[]>;
}

export async function createPlaceConnection(input: unknown): Promise<PlaceConnectionRecord> {
  const parsed = placeConnectionCreateSchema.parse(input);

  if (parsed.fromPlaceId === parsed.toPlaceId) {
    throw new Error('A place cannot connect to itself');
  }

  return prisma.placeConnection.create({
    data: {
      fromPlaceId: parsed.fromPlaceId,
      toPlaceId: parsed.toPlaceId,
      connectionType: parsed.connectionType,
      isBidirectional: parsed.isBidirectional ?? true,
      travelTimeText: parsed.travelTimeText ?? null,
      status: 'active',
      canonState: 'canonical',
    },
    select: connectionSelect,
  }) as Promise<PlaceConnectionRecord>;
}

export async function deletePlaceConnection(id: string): Promise<PlaceConnectionRecord | null> {
  if (!placeConnectionIdSchema.safeParse({ id }).success) return null;
  const existing = await prisma.placeConnection.findFirst({ where: { id, deletedAt: null } });
  if (!existing) return null;

  return prisma.placeConnection.update({
    where: { id },
    data: { deletedAt: new Date(), status: 'archived' },
    select: connectionSelect,
  }) as Promise<PlaceConnectionRecord>;
}
