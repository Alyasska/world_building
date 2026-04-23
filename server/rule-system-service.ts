import { Prisma } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import { ruleSystemCreateSchema, ruleSystemIdSchema, ruleSystemUpdateSchema } from '@/schemas/rule-system';
import { resolveRuleSystemSlug } from './slug';
import { toJsonWrite } from '@/lib/prisma-json';

const ruleSystemSelect = {
  id: true,
  title: true,
  slug: true,
  summary: true,
  content: true,
  status: true,
  canonState: true,
  metadata: true,
  systemKind: true,
  versionLabel: true,
  appliesTo: true,
  createdAt: true,
  updatedAt: true,
  deletedAt: true,
} satisfies Prisma.RuleSystemSelect;

export type RuleSystemRecord = Prisma.RuleSystemGetPayload<{ select: typeof ruleSystemSelect }>;

function isValidId(id: string) {
  return ruleSystemIdSchema.safeParse({ id }).success;
}

export async function listRuleSystems(): Promise<RuleSystemRecord[]> {
  return prisma.ruleSystem.findMany({ where: { deletedAt: null }, orderBy: { createdAt: 'desc' }, select: ruleSystemSelect });
}

export async function getRuleSystem(id: string): Promise<RuleSystemRecord | null> {
  if (!isValidId(id)) return null;
  return prisma.ruleSystem.findFirst({ where: { id, deletedAt: null }, select: ruleSystemSelect });
}

export async function createRuleSystem(input: unknown): Promise<RuleSystemRecord> {
  const parsed = ruleSystemCreateSchema.parse(input);
  const slug = await resolveRuleSystemSlug(parsed.title, parsed.slug);

  return prisma.ruleSystem.create({
    data: {
      title: parsed.title,
      slug,
      summary: parsed.summary ?? null,
      content: parsed.content as Prisma.InputJsonValue | Prisma.NullableJsonNullValueInput | undefined,
      status: parsed.status ?? 'draft',
      canonState: parsed.canonState ?? 'canonical',
      metadata: parsed.metadata as Prisma.InputJsonValue | Prisma.NullableJsonNullValueInput | undefined,
      systemKind: parsed.systemKind ?? null,
      versionLabel: parsed.versionLabel ?? null,
      appliesTo: parsed.appliesTo ?? null,
    },
    select: ruleSystemSelect,
  });
}

export async function updateRuleSystem(id: string, input: unknown): Promise<RuleSystemRecord | null> {
  if (!isValidId(id)) return null;
  const existing = await prisma.ruleSystem.findFirst({ where: { id, deletedAt: null } });
  if (!existing) return null;

  const parsed = ruleSystemUpdateSchema.parse(input);
  const nextSlug = parsed.slug ? await resolveRuleSystemSlug(parsed.title ?? existing.title, parsed.slug, id) : existing.slug;

  return prisma.ruleSystem.update({
    where: { id },
    data: {
      title: parsed.title ?? existing.title,
      slug: nextSlug,
      summary: parsed.summary === undefined ? existing.summary : parsed.summary,
      content: parsed.content === undefined ? toJsonWrite(existing.content) : (parsed.content as Prisma.InputJsonValue | Prisma.NullableJsonNullValueInput),
      status: parsed.status ?? existing.status,
      canonState: parsed.canonState ?? existing.canonState,
      metadata: parsed.metadata === undefined ? toJsonWrite(existing.metadata) : (parsed.metadata as Prisma.InputJsonValue | Prisma.NullableJsonNullValueInput),
      systemKind: parsed.systemKind === undefined ? existing.systemKind : parsed.systemKind,
      versionLabel: parsed.versionLabel === undefined ? existing.versionLabel : parsed.versionLabel,
      appliesTo: parsed.appliesTo === undefined ? existing.appliesTo : parsed.appliesTo,
    },
    select: ruleSystemSelect,
  });
}

export async function deleteRuleSystem(id: string): Promise<RuleSystemRecord | null> {
  if (!isValidId(id)) return null;
  const existing = await prisma.ruleSystem.findFirst({ where: { id, deletedAt: null } });
  if (!existing) return null;

  const now = new Date();
  return prisma.$transaction(async (tx) => {
    await tx.entityLink.updateMany({
      where: { OR: [{ fromEntityType: 'rule-system', fromEntityId: id }, { toEntityType: 'rule-system', toEntityId: id }], deletedAt: null },
      data: { deletedAt: now, status: 'archived' },
    });
    await tx.entityTag.updateMany({
      where: { entityType: 'rule-system', entityId: id, deletedAt: null },
      data: { deletedAt: now, status: 'archived' },
    });
    return tx.ruleSystem.update({ where: { id }, data: { deletedAt: now, status: 'archived' }, select: ruleSystemSelect });
  });
}
