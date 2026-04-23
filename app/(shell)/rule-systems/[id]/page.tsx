import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getRuleSystem } from '@/server/rule-system-service';
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
      <div className="entity-record__head">
        <p className="entity-record__eyebrow">
          {ui.common.entityTypes.ruleSystem}
          {item.systemKind ? ` В· ${item.systemKind}` : ''}
        </p>
        <h1 className="entity-record__name">{item.title}</h1>
        {item.summary ? <p className="entity-record__summary">{item.summary}</p> : null}
        <div className="entity-record__actions">
          <Link href="/rule-systems" className="button-link">{ui.common.backToList}</Link>
          <Link href={`/rule-systems/${item.id}/edit`} className="button-link">{ui.ruleSystems.edit}</Link>
          <DeleteButton endpoint={`/api/rule-systems/${item.id}`} redirectTo="/rule-systems" label={ui.common.delete} confirmText={ui.ruleSystems.deleteConfirm} />
        </div>
      </div>
      <div className="detail-grid">
        <section className="panel detail-panel">
          <p className="entity-section-label">{ui.common.datacore}</p>
          <div className="datacore-grid">
            <div className="datacore-field">
              <span className="datacore-field__key">{ui.ruleSystems.fields.status}</span>
              <span className="datacore-field__val"><StatusBadge value={item.status} label={ui.status[item.status]} /></span>
            </div>
            <div className="datacore-field">
              <span className="datacore-field__key">{ui.ruleSystems.fields.canonState}</span>
              <span className="datacore-field__val"><StatusBadge value={item.canonState} label={ui.status[item.canonState]} /></span>
            </div>
            <div className="datacore-field">
              <span className="datacore-field__key">{ui.ruleSystems.fields.slug}</span>
              <span className="datacore-field__val">{item.slug}</span>
            </div>
            <div className="datacore-field">
              <span className="datacore-field__key">{ui.ruleSystems.fields.systemKind}</span>
              <span className="datacore-field__val">{item.systemKind ?? ui.common.emptyValue}</span>
            </div>
            <div className="datacore-field">
              <span className="datacore-field__key">{ui.ruleSystems.fields.versionLabel}</span>
              <span className="datacore-field__val">{item.versionLabel ?? ui.common.emptyValue}</span>
            </div>
            <div className="datacore-field">
              <span className="datacore-field__key">{ui.ruleSystems.fields.appliesTo}</span>
              <span className="datacore-field__val">{item.appliesTo ?? ui.common.emptyValue}</span>
            </div>
          </div>
        </section>
        <section className="panel detail-panel">
          <p className="entity-section-label">{ui.ruleSystems.fields.content}</p>
          <ContentDisplay content={item.content} emptyText={ui.common.noContentYet} />
        </section>
        <TagManager entityId={item.id} entityType="rule-system" assignedTags={entityTags} availableTags={availableTags} loadError={tagsLoadError} />
      </div>
    </PageContainer>
  );
}
