import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getAsset } from '@/server/asset-service';
import { DeleteButton } from '@/components/ui/delete-button';
import { PageContainer } from '@/components/ui/page-container';
import { SectionHeader } from '@/components/ui/section-header';
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
      <SectionHeader
        title={item.name}
        description={item.summary ?? ui.assets.detailFallback}
        actions={<>
          <Link href="/assets" className="button-link">{ui.common.backToList}</Link>
          <Link href={`/assets/${item.id}/edit`} className="button-link">{ui.assets.edit}</Link>
          <DeleteButton endpoint={`/api/assets/${item.id}`} redirectTo="/assets" label={ui.common.delete} confirmText={ui.assets.deleteConfirm} />
        </>}
      />
      <div className="detail-grid">
        <section className="panel detail-panel">
          <dl className="detail-dl">
            <dt>{ui.assets.fields.slug}</dt><dd>{item.slug}</dd>
            <dt>{ui.assets.fields.status}</dt><dd><StatusBadge value={item.status} label={ui.status[item.status]} /></dd>
            <dt>{ui.assets.fields.canonState}</dt><dd><StatusBadge value={item.canonState} label={ui.status[item.canonState]} /></dd>
            <dt>{ui.assets.fields.assetKind}</dt><dd>{ui.assets.assetKindOptions[item.assetKind]}</dd>
            <dt>{ui.assets.fields.fileName}</dt><dd>{item.fileName}</dd>
            <dt>{ui.assets.fields.mimeType}</dt><dd>{item.mimeType}</dd>
            <dt>{ui.assets.fields.storageKey}</dt><dd>{item.storageKey}</dd>
            {item.altText ? <><dt>{ui.assets.fields.altText}</dt><dd>{item.altText}</dd></> : null}
            {item.sourceUri ? <><dt>{ui.assets.fields.sourceUri}</dt><dd>{item.sourceUri}</dd></> : null}
          </dl>
        </section>
      </div>
    </PageContainer>
  );
}
