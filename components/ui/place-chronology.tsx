import Link from 'next/link';
import type { PlaceChronologySection } from '@/server/place-chronology-service';
import { getUiText } from '@/lib/i18n/ui';

const ui = getUiText();

type PlaceChronologyProps = {
  sections: PlaceChronologySection[];
  emptyText: string;
};

function formatChronologyDate(value: Date | null | undefined): string | null {
  if (!value) {
    return null;
  }

  return value.toISOString().slice(0, 10);
}

function buildEventDateLabel(event: PlaceChronologySection['groups'][number]['events'][number]): string {
  const startAt = formatChronologyDate(event.startAt);
  const endAt = formatChronologyDate(event.endAt);

  if (startAt && endAt && startAt !== endAt) {
    return `${startAt} - ${endAt}`;
  }

  if (startAt) {
    return startAt;
  }

  if (endAt) {
    return endAt;
  }

  return event.eventDateText ?? ui.events.noDate;
}

function buildParticipantLabel(event: PlaceChronologySection['groups'][number]['events'][number]): string | null {
  if (event.participants.length === 0) {
    return null;
  }

  const visible = event.participants.slice(0, 3).map((participant, index) => `${index + 1}. ${participant.name}`);
  const hiddenCount = event.participants.length - visible.length;

  if (hiddenCount > 0) {
    visible.push(`+${hiddenCount}`);
  }

  return visible.join(', ');
}

function formatSectionLabel(section: PlaceChronologySection): string {
  if (section.year !== null) {
    return String(section.year);
  }

  return ui.events.noDate;
}

export function PlaceChronology({ sections, emptyText }: PlaceChronologyProps) {
  if (sections.length === 0) {
    return <p className="muted">{emptyText}</p>;
  }

  return (
    <div className="chronology-stack">
      {sections.map((section) => (
        <section key={section.id} className="chronology-section">
          <h3 className="chronology-section__title">{formatSectionLabel(section)}</h3>
          <div className="chronology-section__groups">
            {section.groups.map((group, index) => (
              <div key={`${section.id}-${group.story?.id ?? 'no-story'}-${index}`} className="chronology-group">
                {group.story ? (
                  <p className="chronology-group__story">
                    <Link href={`/stories/${group.story.id}`}>{group.story.title}</Link>
                  </p>
                ) : null}

                <div className="list-stack">
                  {group.events.map((event) => {
                    const participantLabel = buildParticipantLabel(event);

                    return (
                      <article key={event.id} className="list-item">
                        <div className="list-item__topline">
                          <div>
                            <h4 className="list-item__title">
                              <Link href={`/events/${event.id}`}>{event.title}</Link>
                            </h4>
                            <p className="muted">{buildEventDateLabel(event)}</p>
                            {participantLabel ? (
                              <p className="muted chronology-event-participants">{participantLabel}</p>
                            ) : null}
                          </div>
                        </div>
                        {event.summary ? <p className="list-item__summary">{event.summary}</p> : null}
                      </article>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}