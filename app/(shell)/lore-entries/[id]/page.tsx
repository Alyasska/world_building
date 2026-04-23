import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getLoreEntry } from '@/server/lore-entry-service';
import { listEntityTags } from '@/server/entity-tag-service';
import { listTags } from '@/server/tag-service';
import { ContentDisplay } from '@/components/ui/content-display';
import { DeleteButton } from '@/components/ui/delete-button';
import { PageContainer } from '@/components/ui/page-container';
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
      <div className="entity-record__head">
        <p className="entity-record__eyebrow">
          {ui.common.entityTypes.loreEntry}
          {entry.entryKind ? ` · ${entry.entryKind}` : ''}
        </p>
        <h1 className="entity-record__name">{entry.title}</h1>
        {entry.summary ? <p className="entity-record__summary">{entry.summary}</p> : null}
        <div className="entity-record__actions">
          <Link href="/lore-entries" className="button-link">{ui.common.backToList}</Link>
          <Link href={`/lore-entries/${entry.id}/edit`} className="button-link">{ui.loreEntries.edit}</Link>
          <DeleteButton endpoint={`/api/lore-entries/${entry.id}`} redirectTo="/lore-entries" label={ui.common.delete} confirmText={ui.loreEntries.deleteConfirm} />
        </div>
      </div>

      <div className="detail-grid">
        <section className="panel detail-panel">
          <p className="entity-section-label">{ui.common.datacore}</p>
          <div className="datacore-grid">
            <div className="datacore-field">
              <span className="datacore-field__key">{ui.loreEntries.fields.status}</span>
              <span className="datacore-field__val"><StatusBadge value={entry.status} label={ui.status[entry.status]} /></span>
            </div>
            <div className="datacore-field">
              <span className="datacore-field__key">{ui.loreEntries.fields.canonState}</span>
              <span className="datacore-field__val"><StatusBadge value={entry.canonState} label={ui.status[entry.canonState]} /></span>
            </div>
            <div className="datacore-field">
              <span className="datacore-field__key">{ui.loreEntries.fields.entryKind}</span>
              <span className="datacore-field__val">{entry.entryKind ?? ui.common.emptyValue}</span>
            </div>
            <div className="datacore-field">
              <span className="datacore-field__key">{ui.loreEntries.fields.topic}</span>
              <span className="datacore-field__val">{entry.topic ?? ui.common.emptyValue}</span>
            </div>
          </div>
        </section>

        <section className="panel detail-panel">
          <p className="entity-section-label">{ui.loreEntries.fields.content}</p>
          <ContentDisplay content={entry.content} emptyText={ui.common.noContentYet} />
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
