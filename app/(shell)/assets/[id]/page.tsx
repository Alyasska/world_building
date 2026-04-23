import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getAsset } from '@/server/asset-service';
import { ContentDisplay } from '@/components/ui/content-display';
import { DeleteButton } from '@/components/ui/delete-button';
import { PageContainer } from '@/components/ui/page-container';
import { StatusBadge } from '@/components/ui/status-badge';
import { getUiText } from '@/lib/i18n/ui';

const ui = getUiText();

type PageProps = { params: Promise<{ id: string }> };

export default async function AssetDetailPage({ params }: PageProps) {
  const { id } = await params;
  const item = await getAsset(id);
  if (!item) notFound();

  return (
    <PageContainer narrow>
      <div className="entity-record__head">
        <p className="entity-record__eyebrow">
          {ui.common.entityTypes.asset}
          {item.assetKind ? ` В· ${ui.assets.assetKindOptions[item.assetKind]}` : ''}
        </p>
        <h1 className="entity-record__name">{item.name}</h1>
        {item.summary ? <p className="entity-record__summary">{item.summary}</p> : null}
        <div className="entity-record__actions">
          <Link href="/assets" className="button-link">{ui.common.backToList}</Link>
          <Link href={`/assets/${item.id}/edit`} className="button-link">{ui.assets.edit}</Link>
          <DeleteButton endpoint={`/api/assets/${item.id}`} redirectTo="/assets" label={ui.common.delete} confirmText={ui.assets.deleteConfirm} />
        </div>
      </div>
      <div className="detail-grid">
        <section className="panel detail-panel">
          <p className="entity-section-label">{ui.common.datacore}</p>
          <div className="datacore-grid">
            <div className="datacore-field">
              <span className="datacore-field__key">{ui.assets.fields.status}</span>
              <span className="datacore-field__val"><StatusBadge value={item.status} label={ui.status[item.status]} /></span>
            </div>
            <div className="datacore-field">
              <span className="datacore-field__key">{ui.assets.fields.canonState}</span>
              <span className="datacore-field__val"><StatusBadge value={item.canonState} label={ui.status[item.canonState]} /></span>
            </div>
            <div className="datacore-field">
              <span className="datacore-field__key">{ui.assets.fields.slug}</span>
              <span className="datacore-field__val">{item.slug}</span>
            </div>
            <div className="datacore-field">
              <span className="datacore-field__key">{ui.assets.fields.assetKind}</span>
              <span className="datacore-field__val">{ui.assets.assetKindOptions[item.assetKind]}</span>
            </div>
            <div className="datacore-field">
              <span className="datacore-field__key">{ui.assets.fields.fileName}</span>
              <span className="datacore-field__val">{item.fileName}</span>
            </div>
            <div className="datacore-field">
              <span className="datacore-field__key">{ui.assets.fields.mimeType}</span>
              <span className="datacore-field__val">{item.mimeType}</span>
            </div>
            <div className="datacore-field datacore-field--wide">
              <span className="datacore-field__key">{ui.assets.fields.storageKey}</span>
              <span className="datacore-field__val">{item.storageKey}</span>
            </div>
            {item.altText ? (
              <div className="datacore-field">
                <span className="datacore-field__key">{ui.assets.fields.altText}</span>
                <span className="datacore-field__val">{item.altText}</span>
              </div>
            ) : null}
            {item.sourceUri ? (
              <div className="datacore-field datacore-field--wide">
                <span className="datacore-field__key">{ui.assets.fields.sourceUri}</span>
                <span className="datacore-field__val">{item.sourceUri}</span>
              </div>
            ) : null}
          </div>
        </section>

        <section className="panel detail-panel">
          <p className="entity-section-label">{ui.common.entityTypes.asset}</p>
          <ContentDisplay content={item.content} emptyText={ui.common.noContentYet} />
        </section>
      </div>
    </PageContainer>
  );
}
