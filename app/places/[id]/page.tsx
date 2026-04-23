import Link from 'next/link';
import { notFound } from 'next/navigation';
import { listCharacters } from '@/server/character-service';
import { getPlace, listPlaces } from '@/server/place-service';
import { listEntityTags } from '@/server/entity-tag-service';
import { listEntityLinks } from '@/server/entity-link-service';
import { getPlaceChronology } from '@/server/place-chronology-service';
import { listStoriesByPlace } from '@/server/story-service';
import { listTags } from '@/server/tag-service';
import { listPlaceConnections } from '@/server/place-connection-service';
import { DeleteButton } from '@/components/ui/delete-button';
import { EntityLinkManager } from '@/components/ui/entity-link-manager';
import { PageContainer } from '@/components/ui/page-container';
import { PlaceChronology } from '@/components/ui/place-chronology';
import { PlaceConnectionManager } from '@/components/ui/place-connection-manager';
import { SectionHeader } from '@/components/ui/section-header';
import { StatusBadge } from '@/components/ui/status-badge';
import { TagManager } from '@/components/ui/tag-manager';
import { getUiText } from '@/lib/i18n/ui';

const ui = getUiText();

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function PlaceDetailPage({ params }: PageProps) {
  const { id } = await params;
  const place = await getPlace(id);

  if (!place) {
    notFound();
  }

  const [entityTagsResult, availableTagsResult] = await Promise.allSettled([
    listEntityTags('place', id),
    listTags(),
  ]);
  const [entityLinksResult, charactersResult] = await Promise.allSettled([
    listEntityLinks('place', id),
    listCharacters(),
  ]);
  const [storiesResult, eventsResult] = await Promise.allSettled([
    listStoriesByPlace(id),
    getPlaceChronology(id),
  ]);
  const [connectionsResult, allPlacesResult] = await Promise.allSettled([
    listPlaceConnections(id),
    listPlaces(),
  ]);

  const entityTags = entityTagsResult.status === 'fulfilled' ? entityTagsResult.value : [];
  const availableTags = availableTagsResult.status === 'fulfilled' ? availableTagsResult.value : [];
  const availableCharacters = charactersResult.status === 'fulfilled' ? charactersResult.value : [];
  const relatedLinks =
    entityLinksResult.status === 'fulfilled'
      ? entityLinksResult.value
          .map((link) => {
            const relatedCharacterId = link.fromEntityType === 'place' ? link.toEntityId : link.fromEntityId;
            const relatedCharacter = availableCharacters.find((character) => character.id === relatedCharacterId);

            if (!relatedCharacter) {
              return null;
            }

            return {
              id: link.id,
              relatedEntityId: relatedCharacter.id,
              relatedEntityName: relatedCharacter.name,
              relatedEntityHref: `/characters/${relatedCharacter.id}`,
              relationType: link.relationType,
            };
          })
          .filter((value): value is NonNullable<typeof value> => value !== null)
      : [];
  const tagsLoadError =
    entityTagsResult.status === 'rejected' || availableTagsResult.status === 'rejected'
      ? ui.tags.loadFailed
      : null;
  const linksLoadError =
    entityLinksResult.status === 'rejected' || charactersResult.status === 'rejected'
      ? ui.links.loadFailed
      : null;
  const relatedStories = storiesResult.status === 'fulfilled' ? storiesResult.value : [];
  const chronology = eventsResult.status === 'fulfilled' ? eventsResult.value : [];
  const rawConnections = connectionsResult.status === 'fulfilled' ? connectionsResult.value : [];
  const allPlaces = allPlacesResult.status === 'fulfilled' ? allPlacesResult.value : [];
  const connections = rawConnections.map((conn) => ({
    id: conn.id,
    connectionType: conn.connectionType,
    isBidirectional: conn.isBidirectional,
    travelTimeText: conn.travelTimeText,
    relatedPlace: conn.fromPlaceId === id ? conn.toPlace : conn.fromPlace,
  }));
  const connectionsLoadError = connectionsResult.status === 'rejected' ? ui.placeConnections.loadFailed : null;

  return (
    <PageContainer narrow>
      <SectionHeader
        title={place.name}
        description={place.summary ?? (place.lineage.length > 0 ? place.lineage.map((node) => node.name).join(' / ') : ui.places.detailFallback)}
        actions={
          <>
            <Link href={`/world/${place.id}`} className="button-link">
              {ui.world.title}
            </Link>
            <Link href="/places" className="button-link">
              {ui.common.backToList}
            </Link>
            <Link href={`/places/${place.id}/edit`} className="button-link">
              {ui.places.edit}
            </Link>
            <DeleteButton endpoint={`/api/places/${place.id}`} redirectTo="/places" label={ui.common.delete} confirmText={ui.places.deleteConfirm} />
          </>
        }
      />

      <div className="detail-grid">
        <section className="panel detail-panel">
          <h2>{ui.places.lineageTitle}</h2>
          {place.lineage.length > 0 ? (
            <div className="hierarchy-breadcrumbs">
              {place.lineage.map((node) => (
                <span key={node.id} className="hierarchy-breadcrumbs__item">
                  <Link href={`/places/${node.id}`}>{node.name}</Link>
                </span>
              ))}
              <span className="hierarchy-breadcrumbs__item hierarchy-breadcrumbs__item--current">{place.name}</span>
            </div>
          ) : (
            <p className="muted">{ui.places.rootPlace}</p>
          )}
        </section>

        <section className="panel detail-panel">
          <dl className="detail-dl">
            <dt>{ui.places.fields.slug}</dt>
            <dd>{place.slug}</dd>
            <dt>{ui.places.fields.status}</dt>
            <dd><StatusBadge value={place.status} label={ui.status[place.status]} /></dd>
            <dt>{ui.places.fields.canonState}</dt>
            <dd><StatusBadge value={place.canonState} label={ui.status[place.canonState]} /></dd>
            <dt>{ui.places.fields.placeScale}</dt>
            <dd>{ui.places.scaleOptions[place.placeScale]}</dd>
            <dt>{ui.places.fields.placeKind}</dt>
            <dd>{place.placeKind ?? ui.common.emptyValue}</dd>
            <dt>{ui.places.fields.parentPlace}</dt>
            <dd>
              {place.parentPlace ? (
                <Link href={`/places/${place.parentPlace.id}`}>{place.parentPlace.name}</Link>
              ) : (
                ui.places.rootPlace
              )}
            </dd>
            <dt>{ui.places.fields.locationText}</dt>
            <dd>{place.locationText ?? ui.common.emptyValue}</dd>
          </dl>
        </section>

        <section className="panel detail-panel">
          <h2>{ui.places.childrenTitle}</h2>
          {place.childPlaces.length > 0 ? (
            <div className="list-stack">
              {place.childPlaces.map((childPlace) => (
                <article key={childPlace.id} className="list-item">
                  <div className="list-item__topline">
                    <div>
                      <h3 className="list-item__title">
                        <Link href={`/places/${childPlace.id}`}>{childPlace.name}</Link>
                      </h3>
                      <p className="muted">{ui.places.scaleOptions[childPlace.placeScale]}</p>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <p className="muted">{ui.places.noChildren}</p>
          )}
        </section>

        <section className="panel detail-panel">
          <h2>{ui.places.fields.content}</h2>
          <div className="prose">{place.content ? JSON.stringify(place.content, null, 2) : ui.common.noContentYet}</div>
        </section>

        <section className="panel detail-panel">
          <div className="world-section__header">
            <div>
              <h2>{ui.places.relatedStoriesTitle}</h2>
              <p>{ui.places.relatedStoriesDescription}</p>
            </div>
            <Link href="/stories/new" className="button-link">{ui.stories.new}</Link>
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
            <p className="muted">{ui.places.noRelatedStories}</p>
          )}
        </section>

        <section className="panel detail-panel">
          <div className="world-section__header">
            <div>
              <h2>{ui.places.relatedEventsTitle}</h2>
              <p>{ui.places.relatedEventsDescription}</p>
            </div>
            <Link href="/events/new" className="button-link">{ui.events.new}</Link>
          </div>
          <PlaceChronology sections={chronology} emptyText={ui.places.noRelatedEvents} />
        </section>

        <TagManager
          entityId={place.id}
          entityType="place"
          assignedTags={entityTags}
          availableTags={availableTags}
          loadError={tagsLoadError}
        />

        <EntityLinkManager
          entityId={place.id}
          entityType="place"
          targetEntityType="character"
          relatedLinks={relatedLinks}
          availableEntities={availableCharacters}
          loadError={linksLoadError}
        />

        <PlaceConnectionManager
          placeId={place.id}
          connections={connections}
          availablePlaces={allPlaces}
          loadError={connectionsLoadError}
        />
      </div>
    </PageContainer>
  );
}
