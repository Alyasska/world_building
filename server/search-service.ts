import { prismaSearchProvider } from '@/server/search/providers/prisma-search-provider';
import { placeholderMeilisearchProvider } from '@/server/search/providers/placeholder-meilisearch-provider';
import type { SearchProvider, SearchResult } from '@/server/search/types';

function getSearchProvider(): SearchProvider {
  if (process.env.SEARCH_PROVIDER === 'meilisearch') {
    return placeholderMeilisearchProvider;
  }

  return prismaSearchProvider;
}

export type { SearchEntityType, SearchResult } from '@/server/search/types';

export async function searchWorld(query: string): Promise<SearchResult[]> {
  return getSearchProvider().search(query);
}
