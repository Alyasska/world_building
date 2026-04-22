import Link from 'next/link';
import { notFound } from 'next/navigation';
import { PageContainer } from '@/components/ui/page-container';
import { SectionHeader } from '@/components/ui/section-header';
import { EventForm } from '@/features/events/event-form';
import type { EventDatePrecision } from '@/lib/event-date-precision';
import { toDateInputValue, toTextareaValue } from '@/lib/form';
import { getUiText } from '@/lib/i18n/ui';
import { getEvent } from '@/server/event-service';
import { listPlaces } from '@/server/place-service';
import { listStories } from '@/server/story-service';

const ui = getUiText();

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function EditEventPage({ params }: PageProps) {
  const { id } = await params;
  const [event, places, stories] = await Promise.all([getEvent(id), listPlaces(), listStories()]);

  if (!event) {
    notFound();
  }

  return (
    <PageContainer narrow>
      <SectionHeader
        title={`${ui.events.editTitlePrefix} ${event.title}`}
        description={ui.events.editDescription}
        actions={<Link href={`/events/${event.id}`} className="button-link">{ui.common.backToDetail}</Link>}
      />
      <EventForm
        mode="edit"
        endpoint={`/api/events/${event.id}`}
        redirectTo={(entityId) => `/events/${entityId}`}
        initialValues={{
          title: event.title,
          slug: event.slug,
          summary: event.summary ?? '',
          content: toTextareaValue(event.content),
          status: event.status,
          canonState: event.canonState,
          storyId: event.storyId ?? '',
          placeId: event.placeId ?? '',
          eventDateText: event.eventDateText ?? '',
          startAt: toDateInputValue(event.startAt),
          endAt: toDateInputValue(event.endAt),
          datePrecision: (event.datePrecision as EventDatePrecision) ?? 'unknown',
        }}
        placeOptions={places.map((place) => ({
          id: place.id,
          name: place.name,
          placeScale: place.placeScale,
        }))}
        storyOptions={stories.map((story) => ({
          id: story.id,
          title: story.title,
        }))}
      />
    </PageContainer>
  );
}
