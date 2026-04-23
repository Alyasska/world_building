import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getStory } from '@/server/story-service';
import { listStoryEntities } from '@/server/story-entity-service';
import { listCharacters } from '@/server/character-service';
import { listPlaces } from '@/server/place-service';
import { listFactions } from '@/server/faction-service';
import { ContentDisplay } from '@/components/ui/content-display';
import { DeleteButton } from '@/components/ui/delete-button';
import { PageContainer } from '@/components/ui/page-container';
import { StatusBadge } from '@/components/ui/status-badge';
import { StoryEntityManager } from '@/components/ui/story-entity-manager';
import { getUiText } from '@/lib/i18n/ui';

const ui = getUiText();

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function StoryDetailPage({ params }: PageProps) {
  const { id } = await params;
  const story = await getStory(id);
  if (!story) notFound();

  const [storyEntitiesResult, charactersResult, placesResult, factionsResult] = await Promise.allSettled([
    listStoryEntities(id),
    listCharacters(),
    listPlaces(),
    listFactions(),
  ]);

  const rawEntities = storyEntitiesResult.status === 'fulfilled' ? storyEntitiesResult.value : [];
  const availableCharacters = charactersResult.status === 'fulfilled' ? charactersResult.value : [];
  const availablePlaces = placesResult.status === 'fulfilled' ? placesResult.value : [];
  const availableFactions = factionsResult.status === 'fulfilled' ? factionsResult.value : [];
  const entitiesLoadError = storyEntitiesResult.status === 'rejected' ? ui.storyEntities.loadFailed : null;

  const entityNameMap: Record<string, { name: string; href: string }> = {};
  for (const c of availableCharacters) entityNameMap[c.id] = { name: c.name, href: `/characters/${c.id}` };
  for (const p of availablePlaces) entityNameMap[p.id] = { name: p.name, href: `/places/${p.id}` };
  for (const f of availableFactions) entityNameMap[f.id] = { name: f.name, href: `/factions/${f.id}` };

  const storyEntities = rawEntities.map((e) => ({
    ...e,
    name: entityNameMap[e.entityId]?.name ?? e.entityId,
    href: entityNameMap[e.entityId]?.href ?? '#',
  }));

  return (
    <PageContainer narrow>
      <div className="entity-record__head">
        <p className="entity-record__eyebrow">
          {ui.common.entityTypes.story}
          {story.storyKind ? ` · ${story.storyKind}` : ''}
        </p>
        <h1 className="entity-record__name">{story.title}</h1>
        {story.summary ? <p className="entity-record__summary">{story.summary}</p> : null}
        <div className="entity-record__actions">
          <Link href="/stories" className="button-link">{ui.common.backToList}</Link>
          <Link href={`/stories/${story.id}/edit`} className="button-link">{ui.stories.edit}</Link>
          <DeleteButton endpoint={`/api/stories/${story.id}`} redirectTo="/stories" label={ui.common.delete} confirmText={ui.stories.deleteConfirm} />
        </div>
      </div>

      <div className="detail-grid">
        <section className="panel detail-panel">
          <p className="entity-section-label">{ui.common.datacore}</p>
          <div className="datacore-grid">
            <div className="datacore-field">
              <span className="datacore-field__key">{ui.stories.fields.status}</span>
              <span className="datacore-field__val"><StatusBadge value={story.status} label={ui.status[story.status]} /></span>
            </div>
            <div className="datacore-field">
              <span className="datacore-field__key">{ui.stories.fields.canonState}</span>
              <span className="datacore-field__val"><StatusBadge value={story.canonState} label={ui.status[story.canonState]} /></span>
            </div>
            {story.primaryPlace ? (
              <div className="datacore-field">
                <span className="datacore-field__key">{ui.stories.fields.primaryPlace}</span>
                <span className="datacore-field__val">
                  <Link href={`/places/${story.primaryPlace.id}`}>{story.primaryPlace.name}</Link>
                </span>
              </div>
            ) : null}
            {story.startDateText ? (
              <div className="datacore-field">
                <span className="datacore-field__key">{ui.stories.fields.startDateText}</span>
                <span className="datacore-field__val">{story.startDateText}</span>
              </div>
            ) : null}
            {story.endDateText ? (
              <div className="datacore-field">
                <span className="datacore-field__key">{ui.stories.fields.endDateText}</span>
                <span className="datacore-field__val">{story.endDateText}</span>
              </div>
            ) : null}
          </div>
        </section>

        <section className="panel detail-panel">
          <p className="entity-section-label">{ui.stories.relatedEventsTitle}</p>
          {story.events.length > 0 ? (
            <div className="list-stack">
              {story.events.map((event) => (
                <article key={event.id} className="list-item">
                  <div className="list-item__topline">
                    <div>
                      <p className="list-item__type">{ui.common.entityTypes.event}</p>
                      <h3 className="list-item__title">
                        <Link href={`/events/${event.id}`}>{event.title}</Link>
                      </h3>
                      <p className="muted">
                        {event.eventDateText ?? event.startAt?.toISOString().slice(0, 10) ?? ui.events.noDate}
                        {event.place ? ` · ${event.place.name}` : ''}
                      </p>
                    </div>
                  </div>
                  {event.summary ? <p className="list-item__summary">{event.summary}</p> : null}
                </article>
              ))}
            </div>
          ) : (
            <p className="muted">{ui.stories.noEvents}</p>
          )}
        </section>

        <section className="panel detail-panel">
          <p className="entity-section-label">{ui.stories.fields.content}</p>
          <ContentDisplay content={story.content} emptyText={ui.common.noContentYet} />
        </section>

        <StoryEntityManager
          storyId={story.id}
          entities={storyEntities}
          availableCharacters={availableCharacters}
          availablePlaces={availablePlaces}
          availableFactions={availableFactions}
          loadError={entitiesLoadError}
        />
      </div>
    </PageContainer>
  );
}
