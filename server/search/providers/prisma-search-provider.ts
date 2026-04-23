import { prisma } from '@/lib/prisma';
import { placeScaleValues } from '@/lib/place-scale';
import type { SearchProvider, SearchResult } from '@/server/search/types';

function normalizeQuery(query: string): string {
  return query.trim();
}

export const prismaSearchProvider: SearchProvider = {
  name: 'prisma',
  async search(query: string): Promise<SearchResult[]> {
    const normalizedQuery = normalizeQuery(query);
    const normalizedScaleQuery = normalizedQuery.toLowerCase();
    const matchingPlaceScale = placeScaleValues.find((value) => value === normalizedScaleQuery);

    if (!normalizedQuery) {
      return [];
    }

    const [characters, places] = await Promise.all([
      prisma.character.findMany({
        where: {
          deletedAt: null,
          OR: [
            { name: { contains: normalizedQuery, mode: 'insensitive' } },
            { slug: { contains: normalizedQuery, mode: 'insensitive' } },
            { summary: { contains: normalizedQuery, mode: 'insensitive' } },
            { epithet: { contains: normalizedQuery, mode: 'insensitive' } },
            { pronouns: { contains: normalizedQuery, mode: 'insensitive' } },
          ],
        },
        orderBy: { updatedAt: 'desc' },
        select: {
          id: true,
          name: true,
          slug: true,
          summary: true,
          epithet: true,
        },
        take: 25,
      }),
      prisma.place.findMany({
        where: {
          deletedAt: null,
          OR: [
            { name: { contains: normalizedQuery, mode: 'insensitive' } },
            { slug: { contains: normalizedQuery, mode: 'insensitive' } },
            { summary: { contains: normalizedQuery, mode: 'insensitive' } },
            ...(matchingPlaceScale ? [{ placeScale: { equals: matchingPlaceScale } }] : []),
            { placeKind: { contains: normalizedQuery, mode: 'insensitive' } },
            { locationText: { contains: normalizedQuery, mode: 'insensitive' } },
          ],
        },
        orderBy: { updatedAt: 'desc' },
        select: {
          id: true,
          name: true,
          slug: true,
          summary: true,
          placeScale: true,
          placeKind: true,
        },
        take: 25,
      }),
    ]);

    const characterResults: SearchResult[] = characters.map((character) => ({
      id: character.id,
      entityType: 'character',
      name: character.name,
      slug: character.slug,
      summary: character.summary,
      detail: character.epithet,
      href: `/characters/${character.id}`,
    }));

    const placeResults: SearchResult[] = places.map((place) => ({
      id: place.id,
      entityType: 'place',
      name: place.name,
      slug: place.slug,
      summary: place.summary,
      detail: place.placeKind ?? place.placeScale,
      href: `/places/${place.id}`,
    }));

    return [...characterResults, ...placeResults];
  },
};
