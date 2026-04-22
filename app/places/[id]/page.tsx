import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getPlace } from '@/server/place-service';
import { DeleteButton } from '@/components/ui/delete-button';
import { PageContainer } from '@/components/ui/page-container';
import { SectionHeader } from '@/components/ui/section-header';
import { StatusBadge } from '@/components/ui/status-badge';

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function PlaceDetailPage({ params }: PageProps) {
  const { id } = await params;
  const place = await getPlace(id);

  if (!place) {
    notFound();
  }

  return (
    <PageContainer narrow>
      <SectionHeader
        title={place.name}
        description={place.summary ?? 'Place detail record.'}
        actions={
          <>
            <Link href="/places" className="button-link">
              Back to list
            </Link>
            <Link href={`/places/${place.id}/edit`} className="button-link">
              Edit
            </Link>
            <DeleteButton endpoint={`/api/places/${place.id}`} redirectTo="/places" label="Delete" confirmText="Delete this place?" />
          </>
        }
      />

      <div className="detail-grid">
        <section className="panel detail-panel">
          <dl className="detail-dl">
            <dt>Slug</dt>
            <dd>{place.slug}</dd>
            <dt>Status</dt>
            <dd><StatusBadge value={place.status} /></dd>
            <dt>Canon state</dt>
            <dd><StatusBadge value={place.canonState} label={place.canonState} /></dd>
            <dt>Place kind</dt>
            <dd>{place.placeKind ?? '—'}</dd>
            <dt>Location text</dt>
            <dd>{place.locationText ?? '—'}</dd>
          </dl>
        </section>

        <section className="panel detail-panel">
          <h2>Content</h2>
          <div className="prose">{place.content ? JSON.stringify(place.content, null, 2) : 'No content yet.'}</div>
        </section>
      </div>
    </PageContainer>
  );
}
