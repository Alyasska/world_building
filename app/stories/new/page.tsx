import Link from 'next/link';
import { PageContainer } from '@/components/ui/page-container';
import { SectionHeader } from '@/components/ui/section-header';
import { StoryForm } from '@/features/stories/story-form';
import { getUiText } from '@/lib/i18n/ui';
import { listPlaces } from '@/server/place-service';

const ui = getUiText();

export default async function NewStoryPage() {
  const places = await listPlaces();

  return (
    <PageContainer narrow>
      <SectionHeader
        title={ui.stories.newTitle}
        description={ui.stories.newDescription}
        actions={<Link href="/stories" className="button-link">{ui.common.backToList}</Link>}
      />
      <StoryForm
        mode="create"
        endpoint="/api/stories"
        redirectTo={(id) => `/stories/${id}`}
        placeOptions={places.map((place) => ({
          id: place.id,
          name: place.name,
          placeScale: place.placeScale,
        }))}
      />
    </PageContainer>
  );
}
