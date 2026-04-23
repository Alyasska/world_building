import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getRuleSystem } from '@/server/rule-system-service';
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

export default async function RuleSystemDetailPage({ params }: PageProps) {
  const { id } = await params;
  const item = await getRuleSystem(id);
  if (!item) notFound();

  const [entityTagsResult, availableTagsResult] = await Promise.allSettled([listEntityTags('rule-system', id), listTags()]);
  const entityTags = entityTagsResult.status === 'fulfilled' ? entityTagsResult.value : [];
  const availableTags = availableTagsResult.status === 'fulfilled' ? availableTagsResult.value : [];
  const tagsLoadError = entityTagsResult.status === 'rejected' || availableTagsResult.status === 'rejected' ? ui.tags.loadFailed : null;

  return (
    <PageContainer narrow>
      <SectionHeader
        title={item.title}
        description={item.summary ?? ui.ruleSystems.detailFallback}
        actions={<>
          <Link href="/rule-systems" className="button-link">{ui.common.backToList}</Link>
          <Link href={`/rule-systems/${item.id}/edit`} className="button-link">{ui.ruleSystems.edit}</Link>
          <DeleteButton endpoint={`/api/rule-systems/${item.id}`} redirectTo="/rule-systems" label={ui.common.delete} confirmText={ui.ruleSystems.deleteConfirm} />
        </>}
      />
      <div className="detail-grid">
        <section className="panel detail-panel">
          <dl className="detail-dl">
            <dt>{ui.ruleSystems.fields.slug}</dt><dd>{item.slug}</dd>
            <dt>{ui.ruleSystems.fields.status}</dt><dd><StatusBadge value={item.status} label={ui.status[item.status]} /></dd>
            <dt>{ui.ruleSystems.fields.canonState}</dt><dd><StatusBadge value={item.canonState} label={ui.status[item.canonState]} /></dd>
            <dt>{ui.ruleSystems.fields.systemKind}</dt><dd>{item.systemKind ?? ui.common.emptyValue}</dd>
            <dt>{ui.ruleSystems.fields.versionLabel}</dt><dd>{item.versionLabel ?? ui.common.emptyValue}</dd>
            <dt>{ui.ruleSystems.fields.appliesTo}</dt><dd>{item.appliesTo ?? ui.common.emptyValue}</dd>
          </dl>
        </section>
        <section className="panel detail-panel">
          <h2>{ui.ruleSystems.fields.content}</h2>
          <div className="prose">{item.content ? JSON.stringify(item.content, null, 2) : ui.common.noContentYet}</div>
        </section>
        <TagManager entityId={item.id} entityType="rule-system" assignedTags={entityTags} availableTags={availableTags} loadError={tagsLoadError} />
      </div>
    </PageContainer>
  );
}
