import { prisma } from '@/lib/prisma';
import { slugify } from '@/lib/slug';

type SlugCheckDelegate = {
  findFirst: (args: { where: Record<string, unknown> }) => Promise<{ id: string } | null>;
};

async function uniqueSlug(delegate: SlugCheckDelegate, baseValue: string, excludeId?: string): Promise<string> {
  const baseSlug = slugify(baseValue) || 'item';
  let candidate = baseSlug;
  let suffix = 2;

  while (true) {
    const found = await delegate.findFirst({
      where: {
        slug: candidate,
        ...(excludeId ? { NOT: { id: excludeId } } : {}),
      },
    });

    if (!found) {
      return candidate;
    }

    candidate = `${baseSlug}-${suffix}`;
    suffix += 1;
  }
}

export function resolveCharacterSlug(name: string, providedSlug?: string, excludeId?: string): Promise<string> {
  return uniqueSlug(prisma.character, providedSlug ?? name, excludeId);
}

export function resolvePlaceSlug(name: string, providedSlug?: string, excludeId?: string): Promise<string> {
  return uniqueSlug(prisma.place, providedSlug ?? name, excludeId);
}

export function resolveTagSlug(name: string, providedSlug?: string, excludeId?: string): Promise<string> {
  return uniqueSlug(prisma.tag, providedSlug ?? name, excludeId);
}

export function resolveStorySlug(title: string, providedSlug?: string, excludeId?: string): Promise<string> {
  return uniqueSlug(prisma.story, providedSlug ?? title, excludeId);
}

export function resolveEventSlug(title: string, providedSlug?: string, excludeId?: string): Promise<string> {
  return uniqueSlug(prisma.event, providedSlug ?? title, excludeId);
}
