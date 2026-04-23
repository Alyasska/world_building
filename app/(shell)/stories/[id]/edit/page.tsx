import Link from 'next/link';
import { notFound } from 'next/navigation';
import { PageContainer } from '@/components/ui/page-container';
import { SectionHeader } from '@/components/ui/section-header';
import { StoryForm } from '@/features/stories/story-form';
import { toTextareaValue } from '@/lib/form';
import { getUiText } from '@/lib/i18n/ui';
import { listPlaces } from '@/server/place-service';
import { getStory } from '@/server/story-service';

const ui = getUiText();

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function EditStoryPage({ params }: PageProps) {
  const { id } = await params;
  const [story, places] = await Promise.all([getStory(id), listPlaces()]);

  if (!story) {
    notFound();
  }

  return (
    <PageContainer narrow>
      <SectionHeader
        title={`${ui.stories.editTitlePrefix} ${story.title}`}
        description={ui.stories.editDescription}
        actions={<Link href={`/stories/${story.id}`} className="button-link">{ui.common.backToDetail}</Link>}
      />
      <StoryForm
        mode="edit"
        endpoint={`/api/stories/${story.id}`}
        redirectTo="/stories"
        initialValues={{
          title: story.title,
          slug: story.slug,
          summary: story.summary ?? '',
          content: toTextareaValue(story.content),
          status: story.status,
          canonState: story.canonState,
          storyKind: story.storyKind ?? '',
          primaryPlaceId: story.primaryPlaceId ?? '',
          startDateText: story.startDateText ?? '',
          endDateText: story.endDateText ?? '',
        }}
        placeOptions={places.map((place) => ({
          id: place.id,
          name: place.name,
          placeScale: place.placeScale,
        }))}
      />
    </PageContainer>
  );
}
