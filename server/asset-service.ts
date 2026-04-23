import { Prisma } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import { assetCreateSchema, assetIdSchema, assetUpdateSchema } from '@/schemas/asset';
import { resolveAssetSlug } from './slug';
import { toJsonWrite } from '@/lib/prisma-json';

const assetSelect = {
  id: true,
  name: true,
  slug: true,
  summary: true,
  content: true,
  status: true,
  canonState: true,
  metadata: true,
  assetKind: true,
  storageKey: true,
  fileName: true,
  mimeType: true,
  altText: true,
  sourceUri: true,
  createdAt: true,
  updatedAt: true,
  deletedAt: true,
} satisfies Prisma.AssetSelect;

export type AssetRecord = Prisma.AssetGetPayload<{ select: typeof assetSelect }>;

function isValidId(id: string) {
  return assetIdSchema.safeParse({ id }).success;
}

export async function listAssets(): Promise<AssetRecord[]> {
  return prisma.asset.findMany({ where: { deletedAt: null }, orderBy: { createdAt: 'desc' }, select: assetSelect });
}

export async function getAsset(id: string): Promise<AssetRecord | null> {
  if (!isValidId(id)) return null;
  return prisma.asset.findFirst({ where: { id, deletedAt: null }, select: assetSelect });
}

export async function createAsset(input: unknown): Promise<AssetRecord> {
  const parsed = assetCreateSchema.parse(input);
  const slug = await resolveAssetSlug(parsed.name, parsed.slug);

  return prisma.asset.create({
    data: {
      name: parsed.name,
      slug,
      summary: parsed.summary ?? null,
      content: parsed.content as Prisma.InputJsonValue | Prisma.NullableJsonNullValueInput | undefined,
      status: parsed.status ?? 'draft',
      canonState: parsed.canonState ?? 'canonical',
      metadata: parsed.metadata as Prisma.InputJsonValue | Prisma.NullableJsonNullValueInput | undefined,
      assetKind: parsed.assetKind ?? 'other',
      storageKey: parsed.storageKey,
      fileName: parsed.fileName,
      mimeType: parsed.mimeType,
      altText: parsed.altText ?? null,
      sourceUri: parsed.sourceUri ?? null,
    },
    select: assetSelect,
  });
}

export async function updateAsset(id: string, input: unknown): Promise<AssetRecord | null> {
  if (!isValidId(id)) return null;
  const existing = await prisma.asset.findFirst({ where: { id, deletedAt: null } });
  if (!existing) return null;

  const parsed = assetUpdateSchema.parse(input);
  const nextSlug = parsed.slug ? await resolveAssetSlug(parsed.name ?? existing.name, parsed.slug, id) : existing.slug;

  return prisma.asset.update({
    where: { id },
    data: {
      name: parsed.name ?? existing.name,
      slug: nextSlug,
      summary: parsed.summary === undefined ? existing.summary : parsed.summary,
      content: parsed.content === undefined ? toJsonWrite(existing.content) : (parsed.content as Prisma.InputJsonValue | Prisma.NullableJsonNullValueInput),
      status: parsed.status ?? existing.status,
      canonState: parsed.canonState ?? existing.canonState,
      metadata: parsed.metadata === undefined ? toJsonWrite(existing.metadata) : (parsed.metadata as Prisma.InputJsonValue | Prisma.NullableJsonNullValueInput),
      assetKind: parsed.assetKind ?? existing.assetKind,
      storageKey: parsed.storageKey ?? existing.storageKey,
      fileName: parsed.fileName ?? existing.fileName,
      mimeType: parsed.mimeType ?? existing.mimeType,
      altText: parsed.altText === undefined ? existing.altText : parsed.altText,
      sourceUri: parsed.sourceUri === undefined ? existing.sourceUri : parsed.sourceUri,
    },
    select: assetSelect,
  });
}

export async function deleteAsset(id: string): Promise<AssetRecord | null> {
  if (!isValidId(id)) return null;
  const existing = await prisma.asset.findFirst({ where: { id, deletedAt: null } });
  if (!existing) return null;

  const now = new Date();
  return prisma.$transaction(async (tx) => {
    await tx.assetLink.updateMany({ where: { assetId: id, deletedAt: null }, data: { deletedAt: now, status: 'archived' } });
    return tx.asset.update({ where: { id }, data: { deletedAt: now, status: 'archived' }, select: assetSelect });
  });
}
