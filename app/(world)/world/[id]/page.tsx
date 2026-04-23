import { notFound } from 'next/navigation';
import { WorldExplorer } from '@/components/world-explorer';
import { getPlaceChronology } from '@/server/place-chronology-service';
import { getPlace, listRootPlaces } from '@/server/place-service';
import { listStoriesByPlace } from '@/server/story-service';

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function WorldPlacePage({ params }: PageProps) {
  const { id } = await params;
  const [place, rootPlaces, relatedStories, chronology] = await Promise.all([
    getPlace(id),
    listRootPlaces(),
    listStoriesByPlace(id),
    getPlaceChronology(id),
  ]);

  if (!place) {
    notFound();
  }

  return <WorldExplorer currentPlace={place} rootPlaces={rootPlaces} relatedStories={relatedStories} chronology={chronology} />;
}
