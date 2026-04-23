import Link from 'next/link';
import { PageContainer } from '@/components/ui/page-container';
import { SectionHeader } from '@/components/ui/section-header';
import { PlaceForm } from '@/features/places/place-form';
import { getUiText } from '@/lib/i18n/ui';
import { listPlaceParentOptions } from '@/server/place-service';

const ui = getUiText();

export default async function NewPlacePage() {
  const parentOptions = await listPlaceParentOptions();

  return (
    <PageContainer narrow>
      <SectionHeader
        title={ui.places.newTitle}
        description={ui.places.newDescription}
        actions={<Link href="/places" className="button-link">{ui.common.backToList}</Link>}
      />
      <PlaceForm mode="create" endpoint="/api/places" redirectTo="/places" parentOptions={parentOptions} />
    </PageContainer>
  );
}
