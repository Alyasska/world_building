import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getCharacter, listCharacters } from '@/server/character-service';
import { listPlaces } from '@/server/place-service';
import { listEntityTags } from '@/server/entity-tag-service';
import { listEntityLinks } from '@/server/entity-link-service';
import { listCharacterEventParticipations } from '@/server/event-participant-service';
import { listTags } from '@/server/tag-service';
import { listCharacterRelations } from '@/server/character-relation-service';
import { CharacterRelationManager } from '@/components/ui/character-relation-manager';
import { ContentDisplay } from '@/components/ui/content-display';
import { DeleteButton } from '@/components/ui/delete-button';
import { EntityLinkManager } from '@/components/ui/entity-link-manager';
import { PageContainer } from '@/components/ui/page-container';
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
  const [charRelationsResult, allCharactersResult] = await Promise.allSettled([
    listCharacterRelations(id),
    listCharacters(),
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
  const rawCharRelations = charRelationsResult.status === 'fulfilled' ? charRelationsResult.value : [];
  const allCharacters = allCharactersResult.status === 'fulfilled' ? allCharactersResult.value : [];
  const charRelations = rawCharRelations.map((rel) => ({
    id: rel.id,
    relationType: rel.relationType,
    relatedCharacter: rel.fromCharacterId === id ? rel.toCharacter : rel.fromCharacter,
  }));
  const charRelationsLoadError = charRelationsResult.status === 'rejected' ? ui.characterRelations.loadFailed : null;

  return (
    <PageContainer narrow>
      <div className="entity-record__head">
        <p className="entity-record__eyebrow">{ui.common.entityTypes.character}</p>
        <h1 className="entity-record__name">{character.name}</h1>
        {character.summary ? (
          <p className="entity-record__summary">{character.summary}</p>
        ) : null}
        <div className="entity-record__actions">
          <Link href="/characters" className="button-link">
            {ui.common.backToList}
          </Link>
          <Link href={`/characters/${character.id}/edit`} className="button-link">
            {ui.characters.edit}
          </Link>
          <DeleteButton endpoint={`/api/characters/${character.id}`} redirectTo="/characters" label={ui.common.delete} confirmText={ui.characters.deleteConfirm} />
        </div>
      </div>

      <div className="detail-grid">
        <section className="panel detail-panel">
          <p className="entity-section-label">{ui.common.datacore}</p>
          <div className="datacore-grid">
            <div className="datacore-field">
              <span className="datacore-field__key">{ui.characters.fields.status}</span>
              <span className="datacore-field__val"><StatusBadge value={character.status} label={ui.status[character.status]} /></span>
            </div>
            <div className="datacore-field">
              <span className="datacore-field__key">{ui.characters.fields.canonState}</span>
              <span className="datacore-field__val"><StatusBadge value={character.canonState} label={ui.status[character.canonState]} /></span>
            </div>
            <div className="datacore-field">
              <span className="datacore-field__key">{ui.characters.fields.pronouns}</span>
              <span className="datacore-field__val">{character.pronouns ?? ui.common.emptyValue}</span>
            </div>
            <div className="datacore-field">
              <span className="datacore-field__key">{ui.characters.fields.epithet}</span>
              <span className="datacore-field__val">{character.epithet ?? ui.common.emptyValue}</span>
            </div>
            <div className="datacore-field">
              <span className="datacore-field__key">{ui.characters.fields.slug}</span>
              <span className="datacore-field__val">{character.slug}</span>
            </div>
          </div>
        </section>

        <section className="panel detail-panel">
          <p className="entity-section-label">{ui.characters.fields.content}</p>
          <ContentDisplay content={character.content} emptyText={ui.common.noContentYet} />
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

        <CharacterRelationManager
          characterId={character.id}
          relations={charRelations}
          availableCharacters={allCharacters}
          loadError={charRelationsLoadError}
        />
      </div>
    </PageContainer>
  );
}
