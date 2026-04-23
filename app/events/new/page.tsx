import Link from 'next/link';
import { PageContainer } from '@/components/ui/page-container';
import { SectionHeader } from '@/components/ui/section-header';
import { EventForm } from '@/features/events/event-form';
import { getUiText } from '@/lib/i18n/ui';
import { listPlaces } from '@/server/place-service';
import { listStories } from '@/server/story-service';

const ui = getUiText();

export default async function NewEventPage() {
  const [places, stories] = await Promise.all([listPlaces(), listStories()]);

  return (
    <PageContainer narrow>
      <SectionHeader
        title={ui.events.newTitle}
        description={ui.events.newDescription}
        actions={<Link href="/events" className="button-link">{ui.common.backToList}</Link>}
      />
      <EventForm
        mode="create"
        endpoint="/api/events"
        redirectTo="/events"
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
