import Link from 'next/link';
import { PageContainer } from '@/components/ui/page-container';
import { SectionHeader } from '@/components/ui/section-header';
import { AssetForm } from '@/features/assets/asset-form';
import { getUiText } from '@/lib/i18n/ui';

const ui = getUiText();

export default function NewAssetPage() {
  return (
    <PageContainer narrow>
      <SectionHeader title={ui.assets.newTitle} description={ui.assets.newDescription} actions={<Link href="/assets" className="button-link">{ui.common.backToList}</Link>} />
      <AssetForm mode="create" endpoint="/api/assets" redirectTo="/assets" />
    </PageContainer>
  );
}
