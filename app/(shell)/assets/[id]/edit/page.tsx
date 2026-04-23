import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getAsset } from '@/server/asset-service';
import { PageContainer } from '@/components/ui/page-container';
import { SectionHeader } from '@/components/ui/section-header';
import { AssetForm } from '@/features/assets/asset-form';
import { getUiText } from '@/lib/i18n/ui';

const ui = getUiText();

type PageProps = { params: Promise<{ id: string }> };

export default async function EditAssetPage({ params }: PageProps) {
  const { id } = await params;
  const item = await getAsset(id);
  if (!item) notFound();

  return (
    <PageContainer narrow>
      <SectionHeader title={`${ui.assets.editTitlePrefix} ${item.name}`} description={ui.assets.editDescription} actions={<Link href={`/assets/${item.id}`} className="button-link">{ui.common.backToDetail}</Link>} />
      <AssetForm mode="edit" endpoint={`/api/assets/${item.id}`} redirectTo="/assets" initialValues={{ name: item.name, slug: item.slug, summary: item.summary ?? '', assetKind: item.assetKind, storageKey: item.storageKey, fileName: item.fileName, mimeType: item.mimeType, altText: item.altText ?? '', sourceUri: item.sourceUri ?? '', status: item.status, canonState: item.canonState }} />
    </PageContainer>
  );
}
