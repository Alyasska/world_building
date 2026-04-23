import Link from 'next/link';
import { listLoreEntries } from '@/server/lore-entry-service';
import { EmptyState } from '@/components/ui/empty-state';
import { PageContainer } from '@/components/ui/page-container';
import { SectionHeader } from '@/components/ui/section-header';
import { StatusBadge } from '@/components/ui/status-badge';
import { getUiText } from '@/lib/i18n/ui';

const ui = getUiText();

export default async function LoreEntriesPage() {
  const entries = await listLoreEntries();

  return (
    <PageContainer>
      <SectionHeader
        title={ui.loreEntries.title}
        description={ui.loreEntries.pageDescription}
        actions={<Link href="/lore-entries/new" className="button">{ui.loreEntries.new}</Link>}
      />

      {entries.length === 0 ? (
        <EmptyState
          title={ui.loreEntries.emptyTitle}
          description={ui.loreEntries.emptyDescription}
          action={<Link href="/lore-entries/new" className="button">{ui.loreEntries.create}</Link>}
        />
      ) : (
        <div className="list-stack">
          {entries.map((entry) => (
            <article key={entry.id} className="list-item">
              <div className="list-item__topline">
                <div>
                  <h2 className="list-item__title">
                    <Link href={`/lore-entries/${entry.id}`}>{entry.title}</Link>
                  </h2>
                  <p className="muted">{entry.slug}{entry.entryKind ? ` · ${entry.entryKind}` : ''}{entry.topic ? ` · ${entry.topic}` : ''}</p>
                </div>
                <div className="meta-row">
                  <StatusBadge value={entry.status} label={ui.status[entry.status]} />
                  <StatusBadge value={entry.canonState} label={ui.status[entry.canonState]} />
                </div>
              </div>
              {entry.summary ? <p className="list-item__summary">{entry.summary}</p> : null}
            </article>
          ))}
        </div>
      )}
    </PageContainer>
  );
}
