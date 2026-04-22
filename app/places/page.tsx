import Link from 'next/link';
import { listPlaces } from '@/server/place-service';
import { EmptyState } from '@/components/ui/empty-state';
import { PageContainer } from '@/components/ui/page-container';
import { SectionHeader } from '@/components/ui/section-header';
import { StatusBadge } from '@/components/ui/status-badge';

export default async function PlacesPage() {
  const places = await listPlaces();

  return (
    <PageContainer>
      <SectionHeader
        title="Places"
        description="Locations, regions, and landmarks that will later feed map and relationship layers."
        actions={<Link href="/places/new" className="button">New Place</Link>}
      />

      {places.length === 0 ? (
        <EmptyState title="No places yet" description="Start by creating the first place record." action={<Link href="/places/new" className="button">Create Place</Link>} />
      ) : (
        <div className="list-stack">
          {places.map((place) => (
            <article key={place.id} className="list-item">
              <div className="list-item__topline">
                <div>
                  <h2 className="list-item__title">
                    <Link href={`/places/${place.id}`}>{place.name}</Link>
                  </h2>
                  <p className="muted">{place.slug}</p>
                </div>
                <div className="meta-row">
                  <StatusBadge value={place.status} />
                  <StatusBadge value={place.canonState} label={place.canonState} />
                </div>
              </div>
              {place.placeKind ? <p className="list-item__summary">{place.placeKind}</p> : null}
              {place.summary ? <p className="list-item__summary">{place.summary}</p> : null}
            </article>
          ))}
        </div>
      )}
    </PageContainer>
  );
}
