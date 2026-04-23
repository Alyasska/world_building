import Link from 'next/link';
import type { MapListRecord } from '@/server/map-service';
import type { PlaceListRecord } from '@/server/place-service';
import { getUiText } from '@/lib/i18n/ui';

const ui = getUiText();

type WorldHomeProps = {
  maps: MapListRecord[];
  rootPlaces: PlaceListRecord[];
  stats: {
    places: number | null;
    characters: number | null;
  };
};

export function WorldHome({ maps, rootPlaces, stats }: WorldHomeProps) {
  return (
    <div className="world-home">
      {/* Hero */}
      <div className="world-home__hero">
        <p className="world-home__eyebrow">{ui.world.heroEyebrow}</p>
        <h1 className="world-home__title">{ui.world.title}</h1>
        {ui.world.description ? (
          <p className="world-home__tagline">{ui.world.heroDescription}</p>
        ) : null}
      </div>

      {/* Stats strip */}
      {(stats.places !== null || stats.characters !== null) ? (
        <div className="world-home__stat-grid">
          {stats.places !== null ? (
            <div className="world-stat">
              <span className="world-stat__value">{stats.places}</span>
              <span className="world-stat__label">{ui.places.title}</span>
            </div>
          ) : null}
          {stats.characters !== null ? (
            <div className="world-stat">
              <span className="world-stat__value">{stats.characters}</span>
              <span className="world-stat__label">{ui.characters.title}</span>
            </div>
          ) : null}
          {maps.length > 0 ? (
            <div className="world-stat">
              <span className="world-stat__value">{maps.length}</span>
              <span className="world-stat__label">{ui.maps.title}</span>
            </div>
          ) : null}
        </div>
      ) : null}

      {/* Maps section — dominant */}
      {maps.length > 0 ? (
        <section className="world-home__section">
          <div className="world-home__section-head">
            <p className="entity-section-label">{ui.maps.title}</p>
            <Link href="/maps" className="world-home__section-link">
              {ui.maps.title} →
            </Link>
          </div>
          <div className="world-home__map-grid">
            {maps.map((m) => (
              <Link key={m.id} href={`/maps/${m.id}`} className="world-map-card">
                <div className="world-map-card__canvas" aria-hidden="true">
                  <svg viewBox="0 0 100 60" className="world-map-card__svg">
                    <rect width="100" height="60" className="map-canvas__bg" />
                    <circle cx="30" cy="30" r="18" className="world-map-card__placeholder-shape" />
                    <circle cx="65" cy="20" r="10" className="world-map-card__placeholder-shape" />
                    <rect x="55" y="35" width="25" height="16" rx="2" className="world-map-card__placeholder-shape" />
                  </svg>
                </div>
                <div className="world-map-card__body">
                  <p className="world-map-card__kind">{m.mapKind ?? ui.maps.title}</p>
                  <h2 className="world-map-card__name">{m.name}</h2>
                  {m.summary ? (
                    <p className="world-map-card__summary">{m.summary}</p>
                  ) : null}
                </div>
              </Link>
            ))}
          </div>
        </section>
      ) : null}

      {/* Atlas / root places section */}
      <section className="world-home__section">
        <div className="world-home__section-head">
          <p className="entity-section-label">{ui.world.rootPlacesTitle}</p>
          <Link href="/places" className="world-home__section-link">
            {ui.world.managePlaces} →
          </Link>
        </div>

        {rootPlaces.length === 0 ? (
          <div className="world-home__empty">
            <p className="muted">{ui.world.noRootPlacesTitle}</p>
            <p className="muted" style={{ fontSize: '0.85rem' }}>{ui.world.noRootPlacesDescription}</p>
            <Link href="/places/new" className="button" style={{ marginTop: '1rem' }}>
              {ui.places.new}
            </Link>
          </div>
        ) : (
          <div className="world-home__place-grid">
            {rootPlaces.map((place) => (
              <div key={place.id} className="world-place-card">
                <p className="world-place-card__scale">
                  {ui.places.scaleOptions[place.placeScale]}
                  {place.placeKind ? ` · ${place.placeKind}` : ''}
                </p>
                <h3 className="world-place-card__name">{place.name}</h3>
                {place.summary ? (
                  <p className="world-place-card__summary">{place.summary}</p>
                ) : null}
                {place.childPlaces && place.childPlaces.length > 0 ? (
                  <p className="world-place-card__children">
                    {ui.places.childrenCount(place.childPlaces.length)}
                  </p>
                ) : null}
                <div className="world-place-card__actions">
                  <Link href={`/world/${place.id}`} className="button-link">
                    {ui.world.explorePlace}
                  </Link>
                  <Link href={`/places/${place.id}`} className="button-link">
                    {ui.world.openRecord}
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
