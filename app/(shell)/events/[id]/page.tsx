import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ContentDisplay } from '@/components/ui/content-display';
import { DeleteButton } from '@/components/ui/delete-button';
import { EventParticipantManager } from '@/components/ui/event-participant-manager';
import { PageContainer } from '@/components/ui/page-container';
import { StatusBadge } from '@/components/ui/status-badge';
import { getUiText } from '@/lib/i18n/ui';
import { listCharacters } from '@/server/character-service';
import { listEventParticipants } from '@/server/event-participant-service';
import { getEvent } from '@/server/event-service';

const ui = getUiText();

function formatDateValue(value: Date | null | undefined): string | null {
  if (!value) return null;
  return value.toISOString().slice(0, 10);
}

function formatEventWindow(event: {
  eventDateText: string | null;
  startAt: Date | null;
  endAt: Date | null;
}): string {
  if (event.eventDateText) return event.eventDateText;
  const startAt = formatDateValue(event.startAt);
  const endAt = formatDateValue(event.endAt);
  if (startAt && endAt && startAt !== endAt) return `${startAt} – ${endAt}`;
  return startAt ?? endAt ?? ui.events.noDate;
}

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function EventDetailPage({ params }: PageProps) {
  const { id } = await params;
  const event = await getEvent(id);

  if (!event) {
    notFound();
  }

  const [participantsResult, charactersResult] = await Promise.allSettled([
    listEventParticipants(id),
    listCharacters(),
  ]);

  const participants = participantsResult.status === 'fulfilled' ? participantsResult.value : [];
  const availableCharacters = charactersResult.status === 'fulfilled' ? charactersResult.value : [];
  const participantsLoadError =
    participantsResult.status === 'rejected' || charactersResult.status === 'rejected'
      ? ui.events.participants.loadFailed
      : null;

  const precisionKey = (event.datePrecision ?? 'unknown') as keyof typeof ui.events.datePrecisionOptions;

  return (
    <PageContainer narrow>
      <div className="entity-record__head">
        <p className="entity-record__eyebrow">
          {ui.common.entityTypes.event}
          {event.place ? ` · ${event.place.name}` : ''}
        </p>
        <h1 className="entity-record__name">{event.title}</h1>
        {event.summary ? <p className="entity-record__summary">{event.summary}</p> : null}
        <div className="entity-record__actions">
          <Link href="/events" className="button-link">{ui.common.backToList}</Link>
          <Link href={`/events/${event.id}/edit`} className="button-link">{ui.events.edit}</Link>
          <DeleteButton endpoint={`/api/events/${event.id}`} redirectTo="/events" label={ui.common.delete} confirmText={ui.events.deleteConfirm} />
        </div>
      </div>

      <div className="detail-grid">
        <section className="panel detail-panel">
          <p className="entity-section-label">{ui.common.datacore}</p>
          <div className="datacore-grid">
            <div className="datacore-field">
              <span className="datacore-field__key">{ui.events.fields.place}</span>
              <span className="datacore-field__val">
                {event.place ? <Link href={`/places/${event.place.id}`}>{event.place.name}</Link> : ui.common.emptyValue}
              </span>
            </div>
            <div className="datacore-field">
              <span className="datacore-field__key">{ui.events.fields.story}</span>
              <span className="datacore-field__val">
                {event.story ? <Link href={`/stories/${event.story.id}`}>{event.story.title}</Link> : ui.common.emptyValue}
              </span>
            </div>
            <div className="datacore-field">
              <span className="datacore-field__key">{ui.events.fields.eventDateText}</span>
              <span className="datacore-field__val">{formatEventWindow(event)}</span>
            </div>
            <div className="datacore-field">
              <span className="datacore-field__key">{ui.events.fields.datePrecision}</span>
              <span className="datacore-field__val">{ui.events.datePrecisionOptions[precisionKey]}</span>
            </div>
            <div className="datacore-field">
              <span className="datacore-field__key">{ui.events.fields.status}</span>
              <span className="datacore-field__val"><StatusBadge value={event.status} label={ui.status[event.status]} /></span>
            </div>
            <div className="datacore-field">
              <span className="datacore-field__key">{ui.events.fields.canonState}</span>
              <span className="datacore-field__val"><StatusBadge value={event.canonState} label={ui.status[event.canonState]} /></span>
            </div>
          </div>

          <div style={{ marginTop: '1.25rem' }}>
            <p className="entity-section-label" style={{ marginBottom: '0.5rem' }}>{ui.events.participants.title}</p>
            {participantsLoadError ? (
              <p className="field__error">{participantsLoadError}</p>
            ) : participants.length > 0 ? (
              <ol className="event-context-participants">
                {participants.map((participant, index) => (
                  <li key={participant.id} className="event-context-participant">
                    <span className="event-context-participant__order">{index + 1}.</span>
                    <Link href={`/characters/${participant.character.id}`} className="event-context-participant__name">
                      {participant.character.name}
                    </Link>
                    {participant.role ? <span className="event-context-participant__role">{participant.role}</span> : null}
                  </li>
                ))}
              </ol>
            ) : (
              <p className="muted">{ui.events.participants.empty}</p>
            )}
          </div>
        </section>

        <section className="panel detail-panel">
          <p className="entity-section-label">{ui.events.fields.content}</p>
          <ContentDisplay content={event.content} emptyText={ui.common.noContentYet} />
        </section>

        <EventParticipantManager
          eventId={event.id}
          participants={participants}
          availableCharacters={availableCharacters}
          loadError={participantsLoadError}
        />
      </div>
    </PageContainer>
  );
}
