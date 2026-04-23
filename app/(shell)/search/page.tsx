import Link from 'next/link';
import { PageContainer } from '@/components/ui/page-container';
import { SectionHeader } from '@/components/ui/section-header';
import { StatusBadge } from '@/components/ui/status-badge';
import { getUiText } from '@/lib/i18n/ui';
import { searchWorld } from '@/server/search-service';

const ui = getUiText();

type SearchPageProps = {
  searchParams: Promise<{ q?: string }>;
};

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const { q = '' } = await searchParams;
  const query = q.trim();
  const results = query ? await searchWorld(query) : [];

  return (
    <PageContainer>
      <SectionHeader
        title={ui.search.pageTitle}
        description={query ? `${ui.search.resultsFor} "${query}"` : ui.search.pageDescription}
        actions={
          <Link href="/" className="button-link">
            {ui.common.backToDashboard}
          </Link>
        }
      />

      {!query ? (
        <div className="empty-state">
          <h2 className="empty-state__title">{ui.search.emptyQueryTitle}</h2>
          <p className="empty-state__description">{ui.search.emptyQueryDescription}</p>
        </div>
      ) : results.length === 0 ? (
        <div className="empty-state">
          <h2 className="empty-state__title">{ui.search.noResultsTitle}</h2>
          <p className="empty-state__description">{ui.search.noResultsDescription}</p>
        </div>
      ) : (
        <div className="list-stack">
          {results.map((result) => (
            <article key={`${result.entityType}-${result.id}`} className="list-item">
              <div className="list-item__topline">
                <div>
                  <h2 className="list-item__title">
                    <Link href={result.href}>{result.name}</Link>
                  </h2>
                  <p className="muted">{result.slug}</p>
                </div>
                <div className="meta-row">
                  <StatusBadge
                    value={result.entityType === 'character' ? 'active' : 'canonical'}
                    label={result.entityType === 'character' ? ui.search.characterLabel : ui.search.placeLabel}
                  />
                </div>
              </div>
              {result.summary ? <p className="list-item__summary">{result.summary}</p> : null}
              {result.detail ? <p className="list-item__summary">{result.detail}</p> : null}
            </article>
          ))}
        </div>
      )}
    </PageContainer>
  );
}
