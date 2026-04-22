import { Prisma } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import { tagCreateSchema, tagUpdateSchema } from '@/schemas/tag';
import { resolveTagSlug } from './slug';

const tagSelect = {
  id: true,
  name: true,
  slug: true,
  summary: true,
  content: true,
  status: true,
  canonState: true,
  metadata: true,
  color: true,
  namespace: true,
  createdAt: true,
  updatedAt: true,
  deletedAt: true,
} satisfies Prisma.TagSelect;

export async function listTags() {
  return prisma.tag.findMany({ where: { deletedAt: null }, orderBy: { name: 'asc' }, select: tagSelect });
}

export async function createTag(input: unknown) {
  const parsed = tagCreateSchema.parse(input);
  const slug = await resolveTagSlug(parsed.name, parsed.slug);

  return prisma.tag.create({
    data: {
      name: parsed.name,
      slug,
      summary: parsed.summary ?? null,
      content: parsed.content as Prisma.InputJsonValue | Prisma.NullableJsonNullValueInput | undefined,
      status: parsed.status ?? 'draft',
      canonState: parsed.canonState ?? 'canonical',
      metadata: parsed.metadata as Prisma.InputJsonValue | Prisma.NullableJsonNullValueInput | undefined,
      color: parsed.color ?? null,
      namespace: parsed.namespace ?? 'world',
    },
    select: tagSelect,
  });
}

export async function updateTag(id: string, input: unknown) {
  const existing = await prisma.tag.findFirst({ where: { id, deletedAt: null } });
  if (!existing) return null;

  const parsed = tagUpdateSchema.parse(input);
  const nextSlug = parsed.slug ? await resolveTagSlug(parsed.name ?? existing.name, parsed.slug, id) : existing.slug;

  return prisma.tag.update({
    where: { id },
    data: {
      name: parsed.name ?? existing.name,
      slug: nextSlug,
      summary: parsed.summary === undefined ? existing.summary : parsed.summary,
      content: parsed.content === undefined ? existing.content : (parsed.content as Prisma.InputJsonValue | Prisma.NullableJsonNullValueInput),
      status: parsed.status ?? existing.status,
      canonState: parsed.canonState ?? existing.canonState,
      metadata: parsed.metadata === undefined ? existing.metadata : (parsed.metadata as Prisma.InputJsonValue | Prisma.NullableJsonNullValueInput),
      color: parsed.color === undefined ? existing.color : parsed.color,
      namespace: parsed.namespace ?? existing.namespace,
    },
    select: tagSelect,
  });
}

export async function deleteTag(id: string) {
  const existing = await prisma.tag.findFirst({ where: { id, deletedAt: null } });
  if (!existing) return null;

  return prisma.tag.update({
    where: { id },
    data: { deletedAt: new Date(), status: 'archived' },
    select: tagSelect,
  });
}
