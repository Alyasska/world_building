import Link from 'next/link';
import { PageContainer } from '@/components/ui/page-container';
import { PlaceChronology } from '@/components/ui/place-chronology';
import { SectionHeader } from '@/components/ui/section-header';
import { StatusBadge } from '@/components/ui/status-badge';
import type { PlaceChronologySection } from '@/server/place-chronology-service';
import type { PlaceListRecord, PlaceRecord } from '@/server/place-service';
import type { StoryListRecord } from '@/server/story-service';
import { getUiText } from '@/lib/i18n/ui';

const ui = getUiText();

type WorldExplorerProps = {
  currentPlace?: PlaceRecord | null;
  rootPlaces: PlaceListRecord[];
  stats?: {
    places: number | null;
    characters: number | null;
  };
  relatedStories?: StoryListRecord[];
  chronology?: PlaceChronologySection[];
};

function renderPlaceMeta(place: PlaceListRecord | PlaceRecord) {
  return `${ui.places.scaleOptions[place.placeScale]}${
    place.placeKind ? ` - ${place.placeKind}` : ''
  }`;
}

export function WorldExplorer({
  currentPlace = null,
  rootPlaces,
  stats,
  relatedStories = [],
  chronology = [],
}: WorldExplorerProps) {
  const title = currentPlace ? currentPlace.name : ui.world.title;
  const description = currentPlace
    ? currentPlace.summary ?? ui.world.placeExplorerDescription
    : ui.world.description;
  const placeBody =
    currentPlace && currentPlace.content
      ? JSON.stringify(currentPlace.content, null, 2)
      : currentPlace?.summary ?? null;

  return (
    <PageContainer>
      <SectionHeader
        title={title}
        description={description}
        actions={
          <>
            <Link href="/places" className="button-link">
              {ui.world.managePlaces}
            </Link>
            <Link href="/places/new" className="button">
              {ui.places.new}
            </Link>
          </>
        }
      />

      {!currentPlace ? (
        <div className="world-home">
          <section className="panel world-hero">
            <div className="world-hero__eyebrow">{ui.world.heroEyebrow}</div>
            <h2 className="world-hero__title">{ui.world.heroTitle}</h2>
            <p className="world-hero__description">{ui.world.heroDescription}</p>
            <div className="actions-row">
              <Link href="#world-root-places" className="button">
                {ui.world.openAtlas}
              </Link>
              <Link href="/characters" className="button-link">
                {ui.world.openCharacters}
              </Link>
            </div>
          </section>

          {stats ? (
            <section className="world-stat-grid">
              <article className="dashboard-card">
                <div className="dashboard-card__eyebrow">{ui.world.rootPlacesLabel}</div>
                <h2>{rootPlaces.length}</h2>
                <p>{ui.world.rootPlacesDescription}</p>
              </article>
              <article className="dashboard-card">
                <div className="dashboard-card__eyebrow">{ui.places.title}</div>
                <h2>{stats.places ?? ui.common.emptyValue}</h2>
                <p>{ui.world.totalPlacesDescription}</p>
              </article>
              <article className="dashboard-card">
                <div className="dashboard-card__eyebrow">{ui.characters.title}</div>
                <h2>{stats.characters ?? ui.common.emptyValue}</h2>
                <p>{ui.world.totalCharactersDescription}</p>
              </article>
            </section>
          ) : null}

          <section id="world-root-places" className="panel world-section">
            <div className="world-section__header">
              <div>
                <h2>{ui.world.rootPlacesTitle}</h2>
                <p>{ui.world.rootPlacesIntro}</p>
              </div>
            </div>

            {rootPlaces.length > 0 ? (
              <div className="world-place-grid">
                {rootPlaces.map((place) => (
                  <article key={place.id} className="list-item world-place-card">
                    <div className="list-item__topline">
                      <div>
                        <h3 className="list-item__title">
                          <Link href={`/world/${place.id}`}>{place.name}</Link>
                        </h3>
                        <p className="muted">{renderPlaceMeta(place)}</p>
                      </div>
                      <div className="meta-row">
                        <StatusBadge value={place.status} label={ui.status[place.status]} />
                      </div>
                    </div>
                    {place.summary ? <p className="list-item__summary">{place.summary}</p> : null}
                    <div className="actions-row">
                      <Link href={`/world/${place.id}`} className="button-link">
                        {ui.world.explorePlace}
                      </Link>
                      <Link href={`/places/${place.id}`} className="button-link">
                        {ui.world.openRecord}
                      </Link>
                    </div>
                  </article>
                ))}
              </div>
            ) : (
              <div className="empty-state">
                <h3 className="empty-state__title">{ui.world.noRootPlacesTitle}</h3>
                <p className="empty-state__description">{ui.world.noRootPlacesDescription}</p>
              </div>
            )}
          </section>
        </div>
      ) : (
        <div className="world-grid">
          <aside className="world-sidebar">
            <section className="panel world-section">
              <div className="world-section__header">
                <div>
                  <h2>{ui.world.lineageTitle}</h2>
                  <p>{ui.world.lineageDescription}</p>
                </div>
              </div>
              <div className="hierarchy-breadcrumbs">
                <span className="hierarchy-breadcrumbs__item">
                  <Link href="/world">{ui.world.title}</Link>
                </span>
                {currentPlace.lineage.map((node) => (
                  <span key={node.id} className="hierarchy-breadcrumbs__item">
                    <Link href={`/world/${node.id}`}>{node.name}</Link>
                  </span>
                ))}
                <span className="hierarchy-breadcrumbs__item hierarchy-breadcrumbs__item--current">
                  {currentPlace.name}
                </span>
              </div>
            </section>

            <section className="panel world-section">
              <div className="world-section__header">
                <div>
                  <h2>{ui.world.rootPlacesTitle}</h2>
                  <p>{ui.world.rootPlacesSidebar}</p>
                </div>
              </div>
              <div className="world-jump-list">
                {rootPlaces.map((place) => (
                  <Link
                    key={place.id}
                    href={`/world/${place.id}`}
                    className={`world-jump-link${place.id === currentPlace.id ? ' world-jump-link--active' : ''}`}
                  >
                    <span>{place.name}</span>
                    <span className="muted">{ui.places.scaleOptions[place.placeScale]}</span>
                  </Link>
                ))}
              </div>
            </section>
          </aside>

          <div className="world-main">
            <section className="panel world-section">
              <div className="world-section__header">
                <div>
                  <h2>{ui.world.placeOverviewTitle}</h2>
                  <p>{ui.world.placeOverviewDescription}</p>
                </div>
                <div className="actions-row">
                  <Link href={`/places/${currentPlace.id}`} className="button-link">
                    {ui.world.openRecord}
                  </Link>
                  <Link href={`/places/${currentPlace.id}/edit`} className="button-link">
                    {ui.places.edit}
                  </Link>
                </div>
              </div>

              <dl className="detail-dl">
                <dt>{ui.places.fields.placeScale}</dt>
                <dd>{ui.places.scaleOptions[currentPlace.placeScale]}</dd>
                <dt>{ui.places.fields.parentPlace}</dt>
                <dd>
                  {currentPlace.parentPlace ? (
                    <Link href={`/world/${currentPlace.parentPlace.id}`}>{currentPlace.parentPlace.name}</Link>
                  ) : (
                    ui.places.rootPlace
                  )}
                </dd>
                <dt>{ui.places.fields.locationText}</dt>
                <dd>{currentPlace.locationText ?? ui.common.emptyValue}</dd>
              </dl>

              <div className="prose world-prose">
                {placeBody ?? ui.common.noContentYet}
              </div>
            </section>

            <section className="panel world-section">
              <div className="world-section__header">
                <div>
                  <h2>{ui.world.childrenTitle}</h2>
                  <p>{ui.world.childrenDescription}</p>
                </div>
              </div>

              {currentPlace.childPlaces.length > 0 ? (
                <div className="world-place-grid">
                  {currentPlace.childPlaces.map((childPlace) => (
                    <article key={childPlace.id} className="list-item world-place-card">
                      <div className="list-item__topline">
                        <div>
                          <h3 className="list-item__title">
                            <Link href={`/world/${childPlace.id}`}>{childPlace.name}</Link>
                          </h3>
                          <p className="muted">{ui.places.scaleOptions[childPlace.placeScale]}</p>
                        </div>
                      </div>
                      <div className="actions-row">
                        <Link href={`/world/${childPlace.id}`} className="button-link">
                          {ui.world.drillDown}
                        </Link>
                        <Link href={`/places/${childPlace.id}`} className="button-link">
                          {ui.world.openRecord}
                        </Link>
                      </div>
                    </article>
                  ))}
                </div>
              ) : (
                <p className="muted">{ui.world.noChildrenDescription}</p>
              )}
            </section>

            <section className="panel world-section">
              <div className="world-section__header">
                <div>
                  <h2>{ui.world.relatedStoriesTitle}</h2>
                  <p>{ui.world.relatedStoriesDescription}</p>
                </div>
                <Link href="/stories/new" className="button-link">
                  {ui.stories.new}
                </Link>
              </div>

              {relatedStories.length > 0 ? (
                <div className="list-stack">
                  {relatedStories.map((story) => (
                    <article key={story.id} className="list-item">
                      <div className="list-item__topline">
                        <div>
                          <h3 className="list-item__title">
                            <Link href={`/stories/${story.id}`}>{story.title}</Link>
                          </h3>
                          <p className="muted">{story.storyKind ?? ui.common.emptyValue}</p>
                        </div>
                      </div>
                      {story.summary ? <p className="list-item__summary">{story.summary}</p> : null}
                    </article>
                  ))}
                </div>
              ) : (
                <p className="muted">{ui.world.noRelatedStories}</p>
              )}
            </section>

            <section className="panel world-section">
              <div className="world-section__header">
                <div>
                  <h2>{ui.world.relatedEventsTitle}</h2>
                  <p>{ui.world.relatedEventsDescription}</p>
                </div>
                <Link href="/events/new" className="button-link">
                  {ui.events.new}
                </Link>
              </div>
              <PlaceChronology sections={chronology} emptyText={ui.world.noRelatedEvents} />
            </section>
          </div>
        </div>
      )}
    </PageContainer>
  );
}
