import Link from 'next/link';
import { listMaps } from '@/server/map-service';
import { EmptyState } from '@/components/ui/empty-state';
import { PageContainer } from '@/components/ui/page-container';
import { SectionHeader } from '@/components/ui/section-header';
import { StatusBadge } from '@/components/ui/status-badge';
import { getUiText } from '@/lib/i18n/ui';

const ui = getUiText();

export default async function MapsPage() {
  const maps = await listMaps();

  return (
    <PageContainer>
      <SectionHeader
        title={ui.maps.title}
        description={ui.maps.pageDescription}
        actions={
          <Link href="/world" className="button-link">
            {ui.world.title}
          </Link>
        }
      />

      {maps.length === 0 ? (
        <EmptyState
          title={ui.maps.emptyTitle}
          description={ui.maps.emptyDescription}
        />
      ) : (
        <div className="list-stack">
          {maps.map((map) => (
            <article key={map.id} className="list-item">
              <div className="list-item__topline">
                <div>
                  <h2 className="list-item__title">
                    <Link href={`/maps/${map.id}`}>{map.name}</Link>
                  </h2>
                  {map.mapKind ? (
                    <p className="map-list-card__kind">{map.mapKind}</p>
                  ) : null}
                </div>
                <div className="meta-row">
                  <StatusBadge value={map.status} label={ui.status[map.status]} />
                  <StatusBadge value={map.canonState} label={ui.status[map.canonState]} />
                </div>
              </div>
              {map.summary ? (
                <p className="list-item__summary">{map.summary}</p>
              ) : null}
              <div className="actions-row">
                <Link href={`/maps/${map.id}`} className="button">
                  {ui.maps.viewerTitle}
                </Link>
              </div>
            </article>
          ))}
        </div>
      )}
    </PageContainer>
  );
}
