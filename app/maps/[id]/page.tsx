import { notFound } from 'next/navigation';
import Link from 'next/link';
import { getMap } from '@/server/map-service';
import { listMapRegions } from '@/server/map-region-service';
import { MapViewer } from '@/components/map-viewer';
import { SectionHeader } from '@/components/ui/section-header';
import { getUiText } from '@/lib/i18n/ui';
import type { MapViewerData, MapRegionViewerData } from '@/components/map-viewer';
import type { MapGeometryType } from '@/lib/map-geometry';

const ui = getUiText();

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function MapViewerPage({ params }: PageProps) {
  const { id } = await params;
  const [map, regions] = await Promise.all([
    getMap(id),
    listMapRegions(id),
  ]);

  if (!map) notFound();

  // Project service records to lean view models.
  // Dates and heavy fields are deliberately excluded — the client component
  // only receives what it renders.
  const mapData: MapViewerData = {
    id: map.id,
    name: map.name,
    summary: map.summary,
    mapKind: map.mapKind,
  };

  const regionsData: MapRegionViewerData[] = regions.map((region) => ({
    id: region.id,
    name: region.name,
    summary: region.summary,
    geometryType: region.geometryType as MapGeometryType,
    geometry: region.geometry as Record<string, unknown>,
    labelPoint: region.labelPoint as { x: number; y: number } | null,
    displayOrder: region.displayOrder,
    layerKey: region.layerKey,
    place: region.place
      ? {
          id: region.place.id,
          name: region.place.name,
          slug: region.place.slug,
          placeScale: region.place.placeScale,
        }
      : null,
  }));

  return (
    <div className="map-page">
      <SectionHeader
        title={map.name}
        description={map.summary ?? map.mapKind ?? ui.maps.viewerTitle}
        actions={
          <>
            <Link href="/maps" className="button-link">
              {ui.maps.title}
            </Link>
            <Link href="/world" className="button-link">
              {ui.world.title}
            </Link>
          </>
        }
      />

      <MapViewer map={mapData} regions={regionsData} />
    </div>
  );
}
