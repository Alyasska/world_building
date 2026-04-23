import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getLoreEntry } from '@/server/lore-entry-service';
import { listEntityTags } from '@/server/entity-tag-service';
import { listTags } from '@/server/tag-service';
import { DeleteButton } from '@/components/ui/delete-button';
import { PageContainer } from '@/components/ui/page-container';
import { SectionHeader } from '@/components/ui/section-header';
import { StatusBadge } from '@/components/ui/status-badge';
import { TagManager } from '@/components/ui/tag-manager';
import { getUiText } from '@/lib/i18n/ui';

const ui = getUiText();

type PageProps = { params: Promise<{ id: string }> };

export default async function LoreEntryDetailPage({ params }: PageProps) {
  const { id } = await params;
  const entry = await getLoreEntry(id);

  if (!entry) notFound();

  const [entityTagsResult, availableTagsResult] = await Promise.allSettled([
    listEntityTags('lore-entry', id),
    listTags(),
  ]);

  const entityTags = entityTagsResult.status === 'fulfilled' ? entityTagsResult.value : [];
  const availableTags = availableTagsResult.status === 'fulfilled' ? availableTagsResult.value : [];
  const tagsLoadError = entityTagsResult.status === 'rejected' || availableTagsResult.status === 'rejected' ? ui.tags.loadFailed : null;

  return (
    <PageContainer narrow>
      <SectionHeader
        title={entry.title}
        description={entry.summary ?? ui.loreEntries.detailFallback}
        actions={
          <>
            <Link href="/lore-entries" className="button-link">{ui.common.backToList}</Link>
            <Link href={`/lore-entries/${entry.id}/edit`} className="button-link">{ui.loreEntries.edit}</Link>
            <DeleteButton endpoint={`/api/lore-entries/${entry.id}`} redirectTo="/lore-entries" label={ui.common.delete} confirmText={ui.loreEntries.deleteConfirm} />
          </>
        }
      />

      <div className="detail-grid">
        <section className="panel detail-panel">
          <dl className="detail-dl">
            <dt>{ui.loreEntries.fields.slug}</dt>
            <dd>{entry.slug}</dd>
            <dt>{ui.loreEntries.fields.status}</dt>
            <dd><StatusBadge value={entry.status} label={ui.status[entry.status]} /></dd>
            <dt>{ui.loreEntries.fields.canonState}</dt>
            <dd><StatusBadge value={entry.canonState} label={ui.status[entry.canonState]} /></dd>
            <dt>{ui.loreEntries.fields.entryKind}</dt>
            <dd>{entry.entryKind ?? ui.common.emptyValue}</dd>
            <dt>{ui.loreEntries.fields.topic}</dt>
            <dd>{entry.topic ?? ui.common.emptyValue}</dd>
          </dl>
        </section>

        <section className="panel detail-panel">
          <h2>{ui.loreEntries.fields.content}</h2>
          <div className="prose">{entry.content ? JSON.stringify(entry.content, null, 2) : ui.common.noContentYet}</div>
        </section>

        <TagManager
          entityId={entry.id}
          entityType="lore-entry"
          assignedTags={entityTags}
          availableTags={availableTags}
          loadError={tagsLoadError}
        />
      </div>
    </PageContainer>
  );
}
