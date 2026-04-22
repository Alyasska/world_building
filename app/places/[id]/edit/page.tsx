import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getPlace } from '@/server/place-service';
import { PageContainer } from '@/components/ui/page-container';
import { SectionHeader } from '@/components/ui/section-header';
import { PlaceForm } from '@/features/places/place-form';
import { toTextareaValue } from '@/lib/form';

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function EditPlacePage({ params }: PageProps) {
  const { id } = await params;
  const place = await getPlace(id);

  if (!place) {
    notFound();
  }

  return (
    <PageContainer narrow>
      <SectionHeader
        title={`Edit ${place.name}`}
        description="Update the place without changing the underlying model."
        actions={<Link href={`/places/${place.id}`} className="button-link">Back to detail</Link>}
      />
      <PlaceForm
        mode="edit"
        endpoint={`/api/places/${place.id}`}
        redirectTo={(entityId) => `/places/${entityId}`}
        initialValues={{
          name: place.name,
          slug: place.slug,
          summary: place.summary ?? '',
          content: toTextareaValue(place.content),
          status: place.status,
          canonState: place.canonState,
          placeKind: place.placeKind ?? '',
          locationText: place.locationText ?? '',
        }}
      />
    </PageContainer>
  );
}
