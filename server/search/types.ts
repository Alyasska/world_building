export type SearchEntityType = 'character' | 'place';

export type SearchResult = {
  id: string;
  entityType: SearchEntityType;
  name: string;
  slug: string;
  summary: string | null;
  detail: string | null;
  href: string;
};

export type SearchProvider = {
  name: 'prisma' | 'meilisearch';
  search: (query: string) => Promise<SearchResult[]>;
};
