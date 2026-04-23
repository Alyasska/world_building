import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getFaction } from '@/server/faction-service';
import { listEntityTags } from '@/server/entity-tag-service';
import { listEntityLinks } from '@/server/entity-link-service';
import { listPlaces } from '@/server/place-service';
import { listTags } from '@/server/tag-service';
import { DeleteButton } from '@/components/ui/delete-button';
import { EntityLinkManager } from '@/components/ui/entity-link-manager';
import { PageContainer } from '@/components/ui/page-container';
import { SectionHeader } from '@/components/ui/section-header';
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

            if (!relatedPlace) {
              return null;
            }

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
      <SectionHeader
        title={faction.name}
        description={faction.summary ?? ui.factions.detailFallback}
        actions={
          <>
            <Link href="/factions" className="button-link">
              {ui.common.backToList}
            </Link>
            <Link href={`/factions/${faction.id}/edit`} className="button-link">
              {ui.factions.edit}
            </Link>
            <DeleteButton endpoint={`/api/factions/${faction.id}`} redirectTo="/factions" label={ui.common.delete} confirmText={ui.factions.deleteConfirm} />
          </>
        }
      />

      <div className="detail-grid">
        <section className="panel detail-panel">
          <dl className="detail-dl">
            <dt>{ui.factions.fields.slug}</dt>
            <dd>{faction.slug}</dd>
            <dt>{ui.factions.fields.status}</dt>
            <dd><StatusBadge value={faction.status} label={ui.status[faction.status]} /></dd>
            <dt>{ui.factions.fields.canonState}</dt>
            <dd><StatusBadge value={faction.canonState} label={ui.status[faction.canonState]} /></dd>
            <dt>{ui.factions.fields.factionKind}</dt>
            <dd>{faction.factionKind ?? ui.common.emptyValue}</dd>
          </dl>
        </section>

        <section className="panel detail-panel">
          <h2>{ui.factions.fields.content}</h2>
          <div className="prose">{faction.content ? JSON.stringify(faction.content, null, 2) : ui.common.noContentYet}</div>
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
