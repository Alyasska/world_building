import Link from 'next/link';
import { notFound } from 'next/navigation';
import { DeleteButton } from '@/components/ui/delete-button';
import { EventParticipantManager } from '@/components/ui/event-participant-manager';
import { PageContainer } from '@/components/ui/page-container';
import { SectionHeader } from '@/components/ui/section-header';
import { StatusBadge } from '@/components/ui/status-badge';
import { getUiText } from '@/lib/i18n/ui';
import { listCharacters } from '@/server/character-service';
import { listEventParticipants } from '@/server/event-participant-service';
import { getEvent } from '@/server/event-service';

const ui = getUiText();

const eventContextText =
  ui.meta.htmlLang === 'ru'
    ? {
        title: 'Контекст события',
        description: 'Место, история, дата и порядок участников в одном блоке.',
      }
    : {
        title: 'Event context',
        description: 'Place, story, date, and participant order in one view.',
      };

function formatDateValue(value: Date | null | undefined): string | null {
  if (!value) {
    return null;
  }

  return value.toISOString().slice(0, 10);
}

function formatEventWindow(event: {
  eventDateText: string | null;
  startAt: Date | null;
  endAt: Date | null;
}): string {
  // eventDateText is the canonical display value for fictional-world dates.
  // startAt/endAt are structured fields for machine sorting and real-calendar overlay;
  // they fall back here only when no text label exists.
  if (event.eventDateText) {
    return event.eventDateText;
  }

  const startAt = formatDateValue(event.startAt);
  const endAt = formatDateValue(event.endAt);

  if (startAt && endAt && startAt !== endAt) {
    return `${startAt} - ${endAt}`;
  }

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
      <SectionHeader
        title={event.title}
        description={event.summary ?? ui.events.detailFallback}
        actions={
          <>
            <Link href="/events" className="button-link">{ui.common.backToList}</Link>
            <Link href={`/events/${event.id}/edit`} className="button-link">{ui.events.edit}</Link>
            <DeleteButton endpoint={`/api/events/${event.id}`} redirectTo="/events" label={ui.common.delete} confirmText={ui.events.deleteConfirm} />
          </>
        }
      />

      <div className="detail-grid">
        <section className="panel detail-panel">
          <div className="link-section__header">
            <h2>{eventContextText.title}</h2>
            <p className="muted">{eventContextText.description}</p>
          </div>

          <div className="event-context__meta-grid">
            <div className="event-context__meta-item">
              <span className="event-context__label">{ui.events.fields.place}</span>
              <span>{event.place ? <Link href={`/places/${event.place.id}`}>{event.place.name}</Link> : ui.common.emptyValue}</span>
            </div>
            <div className="event-context__meta-item">
              <span className="event-context__label">{ui.events.fields.story}</span>
              <span>{event.story ? <Link href={`/stories/${event.story.id}`}>{event.story.title}</Link> : ui.common.emptyValue}</span>
            </div>
            <div className="event-context__meta-item">
              <span className="event-context__label">{ui.events.fields.eventDateText}</span>
              <span>{formatEventWindow(event)}</span>
            </div>
            <div className="event-context__meta-item">
              <span className="event-context__label">{ui.events.fields.datePrecision}</span>
              <span>{ui.events.datePrecisionOptions[precisionKey]}</span>
            </div>
          </div>

          <div className="event-context__participants">
            <span className="event-context__label">{ui.events.participants.title}</span>
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
          <dl className="detail-dl">
            <dt>{ui.events.fields.slug}</dt>
            <dd>{event.slug}</dd>
            <dt>{ui.events.fields.status}</dt>
            <dd><StatusBadge value={event.status} label={ui.status[event.status]} /></dd>
            <dt>{ui.events.fields.canonState}</dt>
            <dd><StatusBadge value={event.canonState} label={ui.status[event.canonState]} /></dd>
          </dl>
        </section>

        <section className="panel detail-panel">
          <h2>{ui.events.fields.content}</h2>
          <div className="prose">{event.content ? JSON.stringify(event.content, null, 2) : ui.common.noContentYet}</div>
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
