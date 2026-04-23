import Link from 'next/link';
import { notFound } from 'next/navigation';
import { DeleteButton } from '@/components/ui/delete-button';
import { PageContainer } from '@/components/ui/page-container';
import { SectionHeader } from '@/components/ui/section-header';
import { StatusBadge } from '@/components/ui/status-badge';
import { getUiText } from '@/lib/i18n/ui';
import { getStory } from '@/server/story-service';

const ui = getUiText();

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function StoryDetailPage({ params }: PageProps) {
  const { id } = await params;
  const story = await getStory(id);

  if (!story) {
    notFound();
  }

  return (
    <PageContainer narrow>
      <SectionHeader
        title={story.title}
        description={story.summary ?? ui.stories.detailFallback}
        actions={
          <>
            <Link href="/stories" className="button-link">{ui.common.backToList}</Link>
            <Link href={`/stories/${story.id}/edit`} className="button-link">{ui.stories.edit}</Link>
            <DeleteButton endpoint={`/api/stories/${story.id}`} redirectTo="/stories" label={ui.common.delete} confirmText={ui.stories.deleteConfirm} />
          </>
        }
      />

      <div className="detail-grid">
        <section className="panel detail-panel">
          <dl className="detail-dl">
            <dt>{ui.stories.fields.slug}</dt>
            <dd>{story.slug}</dd>
            <dt>{ui.stories.fields.status}</dt>
            <dd><StatusBadge value={story.status} label={ui.status[story.status]} /></dd>
            <dt>{ui.stories.fields.canonState}</dt>
            <dd><StatusBadge value={story.canonState} label={ui.status[story.canonState]} /></dd>
            <dt>{ui.stories.fields.storyKind}</dt>
            <dd>{story.storyKind ?? ui.common.emptyValue}</dd>
            <dt>{ui.stories.fields.primaryPlace}</dt>
            <dd>
              {story.primaryPlace ? <Link href={`/places/${story.primaryPlace.id}`}>{story.primaryPlace.name}</Link> : ui.common.emptyValue}
            </dd>
            <dt>{ui.stories.fields.startDateText}</dt>
            <dd>{story.startDateText ?? ui.common.emptyValue}</dd>
            <dt>{ui.stories.fields.endDateText}</dt>
            <dd>{story.endDateText ?? ui.common.emptyValue}</dd>
          </dl>
        </section>

        <section className="panel detail-panel">
          <h2>{ui.stories.relatedEventsTitle}</h2>
          {story.events.length > 0 ? (
            <div className="list-stack">
              {story.events.map((event) => (
                <article key={event.id} className="list-item">
                  <div className="list-item__topline">
                    <div>
                      <h3 className="list-item__title">
                        <Link href={`/events/${event.id}`}>{event.title}</Link>
                      </h3>
                      <p className="muted">
                        {event.eventDateText ?? event.startAt?.toISOString().slice(0, 10) ?? ui.events.noDate}
                        {event.place ? ` - ${event.place.name}` : ''}
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
          <h2>{ui.stories.fields.content}</h2>
          <div className="prose">{story.content ? JSON.stringify(story.content, null, 2) : ui.common.noContentYet}</div>
        </section>
      </div>
    </PageContainer>
  );
}
