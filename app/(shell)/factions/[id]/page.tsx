import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getFaction } from '@/server/faction-service';
import { listEntityTags } from '@/server/entity-tag-service';
import { listEntityLinks } from '@/server/entity-link-service';
import { listPlaces } from '@/server/place-service';
import { listTags } from '@/server/tag-service';
import { ContentDisplay } from '@/components/ui/content-display';
import { DeleteButton } from '@/components/ui/delete-button';
import { EntityLinkManager } from '@/components/ui/entity-link-manager';
import { PageContainer } from '@/components/ui/page-container';
import { StatusBadge } from '@/components/ui/status-badge';
import { TagManager } from '@/components/ui/tag-manager';
import { getUiText } from '@/lib/i18n/ui';

const ui = getUiText();

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function FactionDetailPage({ params }: PageProps) {
  const { id } = await params;
  const faction = await getFaction(id);

  if (!faction) {
    notFound();
  }

  const [entityTagsResult, availableTagsResult] = await Promise.allSettled([
    listEntityTags('faction', id),
    listTags(),
  ]);
  const [entityLinksResult, placesResult] = await Promise.allSettled([
    listEntityLinks('faction', id),
    listPlaces(),
  ]);

  const entityTags = entityTagsResult.status === 'fulfilled' ? entityTagsResult.value : [];
  const availableTags = availableTagsResult.status === 'fulfilled' ? availableTagsResult.value : [];
  const availablePlaces = placesResult.status === 'fulfilled' ? placesResult.value : [];
  const relatedLinks =
    entityLinksResult.status === 'fulfilled'
      ? entityLinksResult.value
          .map((link) => {
            const relatedPlaceId = link.fromEntityType === 'faction' ? link.toEntityId : link.fromEntityId;
            const relatedPlace = availablePlaces.find((place) => place.id === relatedPlaceId);
            if (!relatedPlace) return null;
            return {
              id: link.id,
              relatedEntityId: relatedPlace.id,
              relatedEntityName: relatedPlace.name,
              relatedEntityHref: `/places/${relatedPlace.id}`,
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
    entityLinksResult.status === 'rejected' || placesResult.status === 'rejected'
      ? ui.links.loadFailed
      : null;

  return (
    <PageContainer narrow>
      <div className="entity-record__head">
        <p className="entity-record__eyebrow">{ui.common.entityTypes.faction}</p>
        <h1 className="entity-record__name">{faction.name}</h1>
        {faction.summary ? <p className="entity-record__summary">{faction.summary}</p> : null}
        <div className="entity-record__actions">
          <Link href="/factions" className="button-link">{ui.common.backToList}</Link>
          <Link href={`/factions/${faction.id}/edit`} className="button-link">{ui.factions.edit}</Link>
          <DeleteButton endpoint={`/api/factions/${faction.id}`} redirectTo="/factions" label={ui.common.delete} confirmText={ui.factions.deleteConfirm} />
        </div>
      </div>

      <div className="detail-grid">
        <section className="panel detail-panel">
          <p className="entity-section-label">{ui.common.datacore}</p>
          <div className="datacore-grid">
            <div className="datacore-field">
              <span className="datacore-field__key">{ui.factions.fields.status}</span>
              <span className="datacore-field__val"><StatusBadge value={faction.status} label={ui.status[faction.status]} /></span>
            </div>
            <div className="datacore-field">
              <span className="datacore-field__key">{ui.factions.fields.canonState}</span>
              <span className="datacore-field__val"><StatusBadge value={faction.canonState} label={ui.status[faction.canonState]} /></span>
            </div>
            <div className="datacore-field">
              <span className="datacore-field__key">{ui.factions.fields.factionKind}</span>
              <span className="datacore-field__val">{faction.factionKind ?? ui.common.emptyValue}</span>
            </div>
          </div>
        </section>

        <section className="panel detail-panel">
          <p className="entity-section-label">{ui.factions.fields.content}</p>
          <ContentDisplay content={faction.content} emptyText={ui.common.noContentYet} />
        </section>

        <TagManager
          entityId={faction.id}
          entityType="faction"
          assignedTags={entityTags}
          availableTags={availableTags}
          loadError={tagsLoadError}
        />

        <EntityLinkManager
          entityId={faction.id}
          entityType="faction"
          targetEntityType="place"
          relatedLinks={relatedLinks}
          availableEntities={availablePlaces}
          loadError={linksLoadError}
        />
      </div>
    </PageContainer>
  );
}
