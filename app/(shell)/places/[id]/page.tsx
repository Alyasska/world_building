import Link from 'next/link';
import { notFound } from 'next/navigation';
import { listCharacters } from '@/server/character-service';
import { listEntityLinks } from '@/server/entity-link-service';
import { listEntityTags } from '@/server/entity-tag-service';
import { listRegionsByPlace } from '@/server/map-region-service';
import { getPlaceChronology } from '@/server/place-chronology-service';
import { listPlaceConnections } from '@/server/place-connection-service';
import { getPlace, listPlaces } from '@/server/place-service';
import { listStoriesByPlace } from '@/server/story-service';
import { listTags } from '@/server/tag-service';
import { ContentDisplay } from '@/components/ui/content-display';
import { DeleteButton } from '@/components/ui/delete-button';
import { EntityLinkManager } from '@/components/ui/entity-link-manager';
import { PageContainer } from '@/components/ui/page-container';
import { PlaceChronology } from '@/components/ui/place-chronology';
import { PlaceConnectionManager } from '@/components/ui/place-connection-manager';
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
  const [connectionsResult, allPlacesResult, mapRegionsResult] = await Promise.allSettled([
    listPlaceConnections(id),
    listPlaces(),
    listRegionsByPlace(id),
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
            if (!relatedCharacter) return null;
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
  const mapRegions = mapRegionsResult.status === 'fulfilled' ? mapRegionsResult.value : [];
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
      <div className="entity-record__head">
        <p className="entity-record__eyebrow">
          {ui.common.entityTypes.place}
          {place.lineage.length > 0 ? ` В· ${place.lineage.map((n) => n.name).join(' / ')}` : ''}
        </p>
        <h1 className="entity-record__name">{place.name}</h1>
        {place.summary ? <p className="entity-record__summary">{place.summary}</p> : null}
        <div className="entity-record__actions">
          <Link href={`/world/${place.id}`} className="button-link">{ui.world.explorePlace}</Link>
          <Link href="/places" className="button-link">{ui.common.backToList}</Link>
          <Link href={`/places/${place.id}/edit`} className="button-link">{ui.places.edit}</Link>
          <DeleteButton endpoint={`/api/places/${place.id}`} redirectTo="/places" label={ui.common.delete} confirmText={ui.places.deleteConfirm} />
        </div>
      </div>

      <div className="detail-grid">
        <section className="panel detail-panel">
          <p className="entity-section-label">{ui.common.datacore}</p>
          <div className="datacore-grid">
            <div className="datacore-field">
              <span className="datacore-field__key">{ui.places.fields.placeScale}</span>
              <span className="datacore-field__val">
                {ui.places.scaleOptions[place.placeScale]}{place.placeKind ? ` В· ${place.placeKind}` : ''}
              </span>
            </div>
            <div className="datacore-field">
              <span className="datacore-field__key">{ui.places.fields.status}</span>
              <span className="datacore-field__val"><StatusBadge value={place.status} label={ui.status[place.status]} /></span>
            </div>
            <div className="datacore-field">
              <span className="datacore-field__key">{ui.places.fields.canonState}</span>
              <span className="datacore-field__val"><StatusBadge value={place.canonState} label={ui.status[place.canonState]} /></span>
            </div>
            <div className="datacore-field">
              <span className="datacore-field__key">{ui.places.fields.parentPlace}</span>
              <span className="datacore-field__val">
                {place.parentPlace ? (
                  <Link href={`/places/${place.parentPlace.id}`}>{place.parentPlace.name}</Link>
                ) : ui.places.rootPlace}
              </span>
            </div>
            {place.locationText ? (
              <div className="datacore-field">
                <span className="datacore-field__key">{ui.places.fields.locationText}</span>
                <span className="datacore-field__val">{place.locationText}</span>
              </div>
            ) : null}
          </div>
          {place.lineage.length > 0 ? (
            <div style={{ marginTop: '1.25rem' }}>
              <p className="entity-section-label" style={{ marginBottom: '0.5rem' }}>{ui.places.lineageTitle}</p>
              <div className="hierarchy-breadcrumbs">
                {place.lineage.map((node) => (
                  <span key={node.id} className="hierarchy-breadcrumbs__item">
                    <Link href={`/places/${node.id}`}>{node.name}</Link>
                  </span>
                ))}
                <span className="hierarchy-breadcrumbs__item hierarchy-breadcrumbs__item--current">{place.name}</span>
              </div>
            </div>
          ) : null}
        </section>

        <section className="panel detail-panel">
          <p className="entity-section-label">{ui.places.fields.content}</p>
          <ContentDisplay content={place.content} emptyText={ui.common.noContentYet} />
        </section>

        <section className="panel detail-panel">
          <p className="entity-section-label">{ui.places.childrenTitle}</p>
          {place.childPlaces.length > 0 ? (
            <div className="list-stack">
              {place.childPlaces.map((childPlace) => (
                <article key={childPlace.id} className="list-item">
                  <div className="list-item__topline">
                    <div>
                      <p className="list-item__type">{ui.places.scaleOptions[childPlace.placeScale]}</p>
                      <h3 className="list-item__title">
                        <Link href={`/places/${childPlace.id}`}>{childPlace.name}</Link>
                      </h3>
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
          <div className="world-section__header">
            <div>
              <p className="entity-section-label">{ui.maps.title}</p>
              <p className="muted" style={{ fontSize: '0.82rem' }}>
                {mapRegions.length > 0 ? ui.maps.boundPlace : ui.maps.unbound}
              </p>
            </div>
          </div>
          {mapRegions.length > 0 ? (
            <div className="list-stack">
              {mapRegions.map((region) => (
                <article key={region.id} className="list-item">
                  <div className="list-item__topline">
                    <div>
                      <p className="list-item__type">{region.map.name}</p>
                      <h3 className="list-item__title">
                        <Link href={`/maps/${region.map.id}`}>{region.name}</Link>
                      </h3>
                      <p className="list-item__subtitle">{region.layerKey}</p>
                    </div>
                  </div>
                  {region.summary ? <p className="list-item__summary">{region.summary}</p> : null}
                </article>
              ))}
            </div>
          ) : (
            <p className="muted">{ui.maps.unbound}</p>
          )}
        </section>

        <section className="panel detail-panel">
          <div className="world-section__header">
            <div>
              <p className="entity-section-label">{ui.places.relatedStoriesTitle}</p>
              <p className="muted" style={{ fontSize: '0.82rem' }}>{ui.places.relatedStoriesDescription}</p>
            </div>
            <Link href="/stories/new" className="button-link">{ui.stories.new}</Link>
          </div>
          {relatedStories.length > 0 ? (
            <div className="list-stack">
              {relatedStories.map((story) => (
                <article key={story.id} className="list-item">
                  <div className="list-item__topline">
                    <div>
                      <p className="list-item__type">{ui.common.entityTypes.story}</p>
                      <h3 className="list-item__title">
                        <Link href={`/stories/${story.id}`}>{story.title}</Link>
                      </h3>
                      {story.storyKind ? <p className="muted">{story.storyKind}</p> : null}
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
              <p className="entity-section-label">{ui.places.relatedEventsTitle}</p>
              <p className="muted" style={{ fontSize: '0.82rem' }}>{ui.places.relatedEventsDescription}</p>
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
