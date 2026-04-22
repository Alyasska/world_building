import { NextRequest } from 'next/server';
import { internalServerError, successResponse, validationError } from '@/server/response';
import { searchWorld } from '@/server/search-service';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('q') ?? '';

  if (typeof query !== 'string') {
    return validationError('Invalid search query', { q: 'Expected a string query' });
  }

  try {
    const results = await searchWorld(query);
    return successResponse({ query: query.trim(), results });
  } catch {
    return internalServerError('Failed to search');
  }
}
