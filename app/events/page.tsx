import Link from 'next/link';
import { listEvents } from '@/server/event-service';
import { EmptyState } from '@/components/ui/empty-state';
import { PageContainer } from '@/components/ui/page-container';
import { SectionHeader } from '@/components/ui/section-header';
import { StatusBadge } from '@/components/ui/status-badge';
import { getUiText } from '@/lib/i18n/ui';

const ui = getUiText();

export default async function EventsPage() {
  const events = await listEvents();

  return (
    <PageContainer>
      <SectionHeader
        title={ui.events.title}
        description={ui.events.pageDescription}
        actions={<Link href="/events/new" className="button">{ui.events.new}</Link>}
      />

      {events.length === 0 ? (
        <EmptyState
          title={ui.events.emptyTitle}
          description={ui.events.emptyDescription}
          action={<Link href="/events/new" className="button">{ui.events.create}</Link>}
        />
      ) : (
        <div className="list-stack">
          {events.map((event) => (
            <article key={event.id} className="list-item">
              <div className="list-item__topline">
                <div>
                  <h2 className="list-item__title">
                    <Link href={`/events/${event.id}`}>{event.title}</Link>
                  </h2>
                  <p className="muted">
                    {event.place?.name ?? ui.common.emptyValue}
                    {event.story ? ` - ${event.story.title}` : ''}
                  </p>
                </div>
                <div className="meta-row">
                  <StatusBadge value={event.status} label={ui.status[event.status]} />
                  <StatusBadge value={event.canonState} label={ui.status[event.canonState]} />
                </div>
              </div>
              {event.eventDateText ? <p className="list-item__summary">{event.eventDateText}</p> : null}
              {event.summary ? <p className="list-item__summary">{event.summary}</p> : null}
            </article>
          ))}
        </div>
      )}
    </PageContainer>
  );
}
