import Link from 'next/link';
import { listStories } from '@/server/story-service';
import { EmptyState } from '@/components/ui/empty-state';
import { PageContainer } from '@/components/ui/page-container';
import { SectionHeader } from '@/components/ui/section-header';
import { StatusBadge } from '@/components/ui/status-badge';
import { getUiText } from '@/lib/i18n/ui';

const ui = getUiText();

export default async function StoriesPage() {
  const stories = await listStories();

  return (
    <PageContainer>
      <SectionHeader
        title={ui.stories.title}
        description={ui.stories.pageDescription}
        actions={<Link href="/stories/new" className="button">{ui.stories.new}</Link>}
      />

      {stories.length === 0 ? (
        <EmptyState
          title={ui.stories.emptyTitle}
          description={ui.stories.emptyDescription}
          action={<Link href="/stories/new" className="button">{ui.stories.create}</Link>}
        />
      ) : (
        <div className="list-stack">
          {stories.map((story) => (
            <article key={story.id} className="list-item">
              <div className="list-item__topline">
                <div>
                  <p className="list-item__type">
                    {ui.common.entityTypes.story}
                    {story.storyKind ? ` · ${story.storyKind}` : ''}
                  </p>
                  <h2 className="list-item__title">
                    <Link href={`/stories/${story.id}`}>{story.title}</Link>
                  </h2>
                  {story.primaryPlace ? <p className="muted">{story.primaryPlace.name}</p> : null}
                </div>
                <div className="meta-row">
                  <StatusBadge value={story.status} label={ui.status[story.status]} />
                  <StatusBadge value={story.canonState} label={ui.status[story.canonState]} />
                </div>
              </div>
              {story.summary ? <p className="list-item__summary">{story.summary}</p> : null}
            </article>
          ))}
        </div>
      )}
    </PageContainer>
  );
}
