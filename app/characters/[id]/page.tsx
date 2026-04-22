import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getCharacter } from '@/server/character-service';
import { listPlaces } from '@/server/place-service';
import { listEntityTags } from '@/server/entity-tag-service';
import { listEntityLinks } from '@/server/entity-link-service';
import { listCharacterEventParticipations } from '@/server/event-participant-service';
import { listTags } from '@/server/tag-service';
import { DeleteButton } from '@/components/ui/delete-button';
import { EntityLinkManager } from '@/components/ui/entity-link-manager';
import { PageContainer } from '@/components/ui/page-container';
import { SectionHeader } from '@/components/ui/section-header';
import { StatusBadge } from '@/components/ui/status-badge';
import { TagManager } from '@/components/ui/tag-manager';
import { getUiText } from '@/lib/i18n/ui';

const ui = getUiText();

function formatParticipationMeta(participation: {
  sequence: number | null;
  role: string | null;
}): string | null {
  const details = [];

  if (participation.sequence !== null) {
    details.push(`#${participation.sequence}`);
  }

  if (participation.role) {
    details.push(participation.role);
  }

  return details.length > 0 ? details.join(' · ') : null;
}

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function CharacterDetailPage({ params }: PageProps) {
  const { id } = await params;
  const character = await getCharacter(id);

  if (!character) {
    notFound();
  }

  const [entityTagsResult, availableTagsResult] = await Promise.allSettled([
    listEntityTags('character', id),
    listTags(),
  ]);
  const [entityLinksResult, placesResult] = await Promise.allSettled([
    listEntityLinks('character', id),
    listPlaces(),
  ]);
  const eventParticipationsResult = await Promise.allSettled([
    listCharacterEventParticipations(id),
  ]);

  const entityTags = entityTagsResult.status === 'fulfilled' ? entityTagsResult.value : [];
  const availableTags = availableTagsResult.status === 'fulfilled' ? availableTagsResult.value : [];
  const availablePlaces = placesResult.status === 'fulfilled' ? placesResult.value : [];
  const relatedLinks =
    entityLinksResult.status === 'fulfilled'
      ? entityLinksResult.value
          .map((link) => {
            const relatedPlaceId = link.fromEntityType === 'character' ? link.toEntityId : link.fromEntityId;
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
  const relatedEvents =
    eventParticipationsResult[0].status === 'fulfilled'
      ? eventParticipationsResult[0].value
      : [];

  return (
    <PageContainer narrow>
      <SectionHeader
        title={character.name}
        description={character.summary ?? ui.characters.detailFallback}
        actions={
          <>
            <Link href="/characters" className="button-link">
              {ui.common.backToList}
            </Link>
            <Link href={`/characters/${character.id}/edit`} className="button-link">
              {ui.characters.edit}
            </Link>
            <DeleteButton endpoint={`/api/characters/${character.id}`} redirectTo="/characters" label={ui.common.delete} confirmText={ui.characters.deleteConfirm} />
          </>
        }
      />

      <div className="detail-grid">
        <section className="panel detail-panel">
          <dl className="detail-dl">
            <dt>{ui.characters.fields.slug}</dt>
            <dd>{character.slug}</dd>
            <dt>{ui.characters.fields.status}</dt>
            <dd><StatusBadge value={character.status} label={ui.status[character.status]} /></dd>
            <dt>{ui.characters.fields.canonState}</dt>
            <dd><StatusBadge value={character.canonState} label={ui.status[character.canonState]} /></dd>
            <dt>{ui.characters.fields.pronouns}</dt>
            <dd>{character.pronouns ?? ui.common.emptyValue}</dd>
            <dt>{ui.characters.fields.epithet}</dt>
            <dd>{character.epithet ?? ui.common.emptyValue}</dd>
          </dl>
        </section>

        <section className="panel detail-panel">
          <h2>{ui.characters.fields.content}</h2>
          <div className="prose">{character.content ? JSON.stringify(character.content, null, 2) : ui.common.noContentYet}</div>
        </section>

        <section className="panel detail-panel">
          <h2>{ui.characters.relatedEventsTitle}</h2>
          {relatedEvents.length > 0 ? (
            <div className="list-stack">
              {relatedEvents.map((participation) => (
                <article key={participation.id} className="list-item">
                  <div className="list-item__topline">
                    <div>
                      <h3 className="list-item__title">
                        <Link href={`/events/${participation.event.id}`}>{participation.event.title}</Link>
                      </h3>
                      <p className="muted">
                        {participation.event.eventDateText ??
                          participation.event.startAt?.toISOString().slice(0, 10) ??
                          ui.events.noDate}
                        {formatParticipationMeta(participation) ? ` · ${formatParticipationMeta(participation)}` : ''}
                      </p>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <p className="muted">{ui.characters.noRelatedEvents}</p>
          )}
        </section>

        <TagManager
          entityId={character.id}
          entityType="character"
          assignedTags={entityTags}
          availableTags={availableTags}
          loadError={tagsLoadError}
        />

        <EntityLinkManager
          entityId={character.id}
          entityType="character"
          targetEntityType="place"
          relatedLinks={relatedLinks}
          availableEntities={availablePlaces}
          loadError={linksLoadError}
        />
      </div>
    </PageContainer>
  );
}
