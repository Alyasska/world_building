import type { MapGeometryType } from '@/lib/map-geometry';

export type MapViewerData = {
  id: string;
  name: string;
  summary: string | null;
  mapKind: string | null;
};

export type MapRegionViewerData = {
  id: string;
  name: string;
  summary: string | null;
  geometryType: MapGeometryType;
  geometry: Record<string, unknown>;
  labelPoint: { x: number; y: number } | null;
  displayOrder: number;
  layerKey: string;
  place: {
    id: string;
    name: string;
    slug: string;
    placeScale: string;
  } | null;
};

export type MapSurfaceEngine = 'svg';

export type MapWorkspaceMode = 'explore';
