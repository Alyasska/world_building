"use client";

import type { MapGeometryType } from '@/lib/map-geometry';
import type { MapRegionViewerData, MapViewerData } from '@/components/maps/types';

type SvgMapSurfaceProps = {
  map: MapViewerData;
  regions: MapRegionViewerData[];
  selectedId: string | null;
  onRegionSelect: (id: string) => void;
  onCanvasClear: () => void;
};

function computeLabelPoint(
  type: MapGeometryType,
  geo: Record<string, unknown>,
): { x: number; y: number } {
  switch (type) {
    case 'point': {
      const x = geo.x as number;
      const y = geo.y as number;
      return { x, y: y + 30 };
    }
    case 'rect': {
      const x = geo.x as number;
      const y = geo.y as number;
      const width = geo.width as number;
      const height = geo.height as number;
      return { x: x + width / 2, y: y + height / 2 };
    }
    case 'polygon': {
      const points = geo.points as Array<{ x: number; y: number }>;
      return {
        x: points.reduce((sum, point) => sum + point.x, 0) / points.length,
        y: points.reduce((sum, point) => sum + point.y, 0) / points.length,
      };
    }
  }
}

function RegionShape({
  region,
  isSelected,
}: {
  region: MapRegionViewerData;
  isSelected: boolean;
}) {
  const isBound = region.place !== null;
  const shapeClass = isSelected
    ? 'map-region__shape--selected'
    : isBound
      ? 'map-region__shape--bound'
      : 'map-region__shape--unbound';

  const labelPoint =
    region.labelPoint ?? computeLabelPoint(region.geometryType, region.geometry);
  const labelClass = `map-region__label${!isBound ? ' map-region__label--muted' : ''}`;

  let shape: React.ReactNode;

  switch (region.geometryType) {
    case 'point': {
      const geometry = region.geometry as { x: number; y: number };
      shape = (
        <>
          <circle cx={geometry.x} cy={geometry.y} r={26} fill="transparent" />
          <circle cx={geometry.x} cy={geometry.y} r={13} className={shapeClass} />
        </>
      );
      break;
    }
    case 'rect': {
      const geometry = region.geometry as {
        x: number;
        y: number;
        width: number;
        height: number;
      };
      shape = (
        <rect
          x={geometry.x}
          y={geometry.y}
          width={geometry.width}
          height={geometry.height}
          rx={6}
          className={shapeClass}
        />
      );
      break;
    }
    case 'polygon': {
      const geometry = region.geometry as { points: Array<{ x: number; y: number }> };
      shape = (
        <polygon
          points={geometry.points.map((point) => `${point.x},${point.y}`).join(' ')}
          className={shapeClass}
        />
      );
      break;
    }
  }

  return (
    <>
      {shape}
      <text x={labelPoint.x} y={labelPoint.y} className={labelClass}>
        {region.name}
      </text>
    </>
  );
}

export function SvgMapSurface({
  map,
  regions,
  selectedId,
  onRegionSelect,
  onCanvasClear,
}: SvgMapSurfaceProps) {
  return (
    <div className="map-canvas">
      <svg
        viewBox="0 0 1000 1000"
        className="map-canvas__svg"
        preserveAspectRatio="xMidYMid meet"
        onClick={(event) => {
          if (event.target === event.currentTarget) {
            onCanvasClear();
          }
        }}
        aria-label={map.name}
      >
        <rect width="1000" height="1000" className="map-canvas__bg" />

        <g className="map-canvas__viewport">
          {regions.map((region) => (
            <g
              key={region.id}
              className="map-region"
              onClick={(event) => {
                event.stopPropagation();
                onRegionSelect(region.id);
              }}
              tabIndex={0}
              role="button"
              aria-label={region.name}
              aria-pressed={region.id === selectedId}
              onKeyDown={(event) => {
                if (event.key === 'Enter' || event.key === ' ') {
                  event.preventDefault();
                  onRegionSelect(region.id);
                }
              }}
            >
              <RegionShape region={region} isSelected={region.id === selectedId} />
            </g>
          ))}
        </g>
      </svg>
    </div>
  );
}
