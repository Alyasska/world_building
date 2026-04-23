import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getPlace, listPlaceParentOptions } from '@/server/place-service';
import { PageContainer } from '@/components/ui/page-container';
import { SectionHeader } from '@/components/ui/section-header';
import { PlaceForm } from '@/features/places/place-form';
import { toTextareaValue } from '@/lib/form';
import { getUiText } from '@/lib/i18n/ui';

const ui = getUiText();

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function EditPlacePage({ params }: PageProps) {
  const { id } = await params;
  const [place, parentOptions] = await Promise.all([
    getPlace(id),
    listPlaceParentOptions(id),
  ]);

  if (!place) {
    notFound();
  }

  return (
    <PageContainer narrow>
      <SectionHeader
        title={`${ui.places.editTitlePrefix} ${place.name}`}
        description={ui.places.editDescription}
        actions={<Link href={`/places/${place.id}`} className="button-link">{ui.common.backToDetail}</Link>}
      />
      <PlaceForm
        mode="edit"
        endpoint={`/api/places/${place.id}`}
        redirectTo="/places"
        initialValues={{
          name: place.name,
          slug: place.slug,
          summary: place.summary ?? '',
          content: toTextareaValue(place.content),
          status: place.status,
          canonState: place.canonState,
          placeScale: place.placeScale,
          placeKind: place.placeKind ?? '',
          parentPlaceId: place.parentPlaceId ?? '',
          locationText: place.locationText ?? '',
        }}
        parentOptions={parentOptions}
      />
    </PageContainer>
  );
}
