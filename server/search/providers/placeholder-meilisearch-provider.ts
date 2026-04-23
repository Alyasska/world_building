import { prismaSearchProvider } from '@/server/search/providers/prisma-search-provider';
import type { SearchProvider } from '@/server/search/types';

export const placeholderMeilisearchProvider: SearchProvider = {
  name: 'meilisearch',
  async search(query) {
    return prismaSearchProvider.search(query);
  },
};
