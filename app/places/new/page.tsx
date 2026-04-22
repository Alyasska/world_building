import Link from 'next/link';
import { PageContainer } from '@/components/ui/page-container';
import { SectionHeader } from '@/components/ui/section-header';
import { PlaceForm } from '@/features/places/place-form';

export default function NewPlacePage() {
  return (
    <PageContainer narrow>
      <SectionHeader
        title="New Place"
        description="Create a minimal place record. This stays data-first and map-agnostic for now."
        actions={<Link href="/places" className="button-link">Back to list</Link>}
      />
      <PlaceForm mode="create" endpoint="/api/places" redirectTo={(id) => `/places/${id}`} />
    </PageContainer>
  );
}
