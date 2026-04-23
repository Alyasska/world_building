"use client";

import { SvgMapSurface } from '@/components/maps/svg-map-surface';
import type {
  MapRegionViewerData,
  MapSurfaceEngine,
  MapViewerData,
  MapWorkspaceMode,
} from '@/components/maps/types';

type MapSurfaceProps = {
  engine: MapSurfaceEngine;
  mode: MapWorkspaceMode;
  map: MapViewerData;
  regions: MapRegionViewerData[];
  selectedId: string | null;
  onRegionSelect: (id: string) => void;
  onCanvasClear: () => void;
};

export function MapSurface({
  engine,
  mode,
  map,
  regions,
  selectedId,
  onRegionSelect,
  onCanvasClear,
}: MapSurfaceProps) {
  let engineView: React.ReactNode;

  switch (engine) {
    case 'svg':
      engineView = (
        <SvgMapSurface
          map={map}
          regions={regions}
          selectedId={selectedId}
          onRegionSelect={onRegionSelect}
          onCanvasClear={onCanvasClear}
        />
      );
      break;
  }

  return (
    <div className="map-surface" data-map-engine={engine} data-map-mode={mode}>
      <div className="map-surface__engine">{engineView}</div>
    </div>
  );
}
