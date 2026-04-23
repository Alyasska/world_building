import Link from 'next/link';
import { listPlaces } from '@/server/place-service';
import { EmptyState } from '@/components/ui/empty-state';
import { PageContainer } from '@/components/ui/page-container';
import { SectionHeader } from '@/components/ui/section-header';
import { StatusBadge } from '@/components/ui/status-badge';
import { getUiText } from '@/lib/i18n/ui';

const ui = getUiText();

export default async function PlacesPage() {
  const places = await listPlaces();

  return (
    <PageContainer>
      <SectionHeader
        title={ui.places.title}
        description={ui.places.pageDescription}
        actions={
          <>
            <Link href="/world" className="button-link">{ui.world.title}</Link>
            <Link href="/places/new" className="button">{ui.places.new}</Link>
          </>
        }
      />

      {places.length === 0 ? (
        <EmptyState title={ui.places.emptyTitle} description={ui.places.emptyDescription} action={<Link href="/places/new" className="button">{ui.places.create}</Link>} />
      ) : (
        <div className="list-stack">
          {places.map((place) => (
            <article key={place.id} className="list-item">
              <div className="list-item__topline">
                <div>
                  <h2 className="list-item__title">
                    <Link href={`/places/${place.id}`}>{place.name}</Link>
                  </h2>
                  <p className="muted">
                    {ui.places.scaleOptions[place.placeScale]}
                    {place.parentPlace ? ` - ${ui.places.fields.parentPlace}: ${place.parentPlace.name}` : ` - ${ui.places.rootPlace}`}
                  </p>
                </div>
                <div className="meta-row">
                  <StatusBadge value={place.status} label={ui.status[place.status]} />
                  <StatusBadge value={place.canonState} label={ui.status[place.canonState]} />
                </div>
              </div>
              {place.placeKind ? <p className="list-item__summary">{place.placeKind}</p> : null}
              {place.childPlaces.length > 0 ? <p className="list-item__summary">{ui.places.childrenCount(place.childPlaces.length)}</p> : null}
              {place.summary ? <p className="list-item__summary">{place.summary}</p> : null}
            </article>
          ))}
        </div>
      )}
    </PageContainer>
  );
}
