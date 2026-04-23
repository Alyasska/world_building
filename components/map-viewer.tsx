"use client";

import { useState } from 'react';
import Link from 'next/link';
import { getUiText } from '@/lib/i18n/ui';
import type { MapGeometryType } from '@/lib/map-geometry';

const ui = getUiText();

// Lean view models — no Date fields, only what the viewer renders.
// Constructed in the RSC page from the full service records.
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
  // Opaque JSON from the DB; cast to typed shapes in render helpers below.
  geometry: Record<string, unknown>;
  // Pre-validated { x, y } or null (falls back to centroid computation).
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

// ── Geometry helpers ──────────────────────────────────────────────────

// Canonical coordinate space: 0 0 1000 1000 (unitless).
// All stored geometry x/y/width/height/points are in this space.
// Future zoom/pan: wrap regions in <g transform="scale(...) translate(...)">
// without touching the coordinates or this component's logic.

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
      const w = geo.width as number;
      const h = geo.height as number;
      return { x: x + w / 2, y: y + h / 2 };
    }
    case 'polygon': {
      const pts = geo.points as Array<{ x: number; y: number }>;
      return {
        x: pts.reduce((s, p) => s + p.x, 0) / pts.length,
        y: pts.reduce((s, p) => s + p.y, 0) / pts.length,
      };
    }
  }
}

// ── Region shape renderer ─────────────────────────────────────────────

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

  const labelPt =
    region.labelPoint ?? computeLabelPoint(region.geometryType, region.geometry);
  const labelClass = `map-region__label${!isBound ? ' map-region__label--muted' : ''}`;

  let shape: React.ReactNode;

  switch (region.geometryType) {
    case 'point': {
      const geo = region.geometry as { x: number; y: number };
      shape = (
        <>
          {/* Larger transparent hit target for small point markers */}
          <circle cx={geo.x} cy={geo.y} r={26} fill="transparent" />
          <circle cx={geo.x} cy={geo.y} r={13} className={shapeClass} />
        </>
      );
      break;
    }
    case 'rect': {
      const geo = region.geometry as {
        x: number;
        y: number;
        width: number;
        height: number;
      };
      shape = (
        <rect
          x={geo.x}
          y={geo.y}
          width={geo.width}
          height={geo.height}
          rx={6}
          className={shapeClass}
        />
      );
      break;
    }
    case 'polygon': {
      const geo = region.geometry as { points: Array<{ x: number; y: number }> };
      shape = (
        <polygon
          points={geo.points.map((p) => `${p.x},${p.y}`).join(' ')}
          className={shapeClass}
        />
      );
      break;
    }
  }

  return (
    <>
      {shape}
      <text x={labelPt.x} y={labelPt.y} className={labelClass}>
        {region.name}
      </text>
    </>
  );
}

// ── Region detail panel ───────────────────────────────────────────────

function RegionDetail({ region }: { region: MapRegionViewerData }) {
  return (
    <div className="panel map-panel-detail">
      <p className="map-panel-detail__eyebrow">{ui.maps.regionList}</p>
      <h2>{region.name}</h2>
      {region.summary ? (
        <p className="map-panel-detail__summary">{region.summary}</p>
      ) : null}

      {region.place ? (
        <div className="map-panel-detail__place">
          <p className="map-panel-detail__eyebrow" style={{ marginBottom: 4 }}>
            {ui.maps.boundPlace}
          </p>
          <p className="map-panel-detail__place-scale">{region.place.placeScale}</p>
          <p className="map-panel-detail__place-name">{region.place.name}</p>
          <div className="actions-row">
            <Link href={`/places/${region.place.id}`} className="button-link">
              {ui.maps.openPlace}
            </Link>
            <Link href={`/world/${region.place.id}`} className="button-link">
              {ui.maps.explorePlace}
            </Link>
          </div>
        </div>
      ) : (
        <p className="map-panel-detail__unbound">{ui.maps.unbound}</p>
      )}
    </div>
  );
}

// ── Region list in panel ──────────────────────────────────────────────

function RegionList({
  regions,
  selectedId,
  onSelect,
}: {
  regions: MapRegionViewerData[];
  selectedId: string | null;
  onSelect: (id: string) => void;
}) {
  if (regions.length === 0) return null;

  return (
    <div className="panel">
      <div className="map-region-list">
        <div className="map-region-list__header">
          <h3 className="map-region-list__title">{ui.maps.regionList}</h3>
          <span className="muted" style={{ fontSize: '0.78rem' }}>{regions.length}</span>
        </div>
        {regions.map((region) => (
          <button
            key={region.id}
            type="button"
            className={`map-region-item${region.id === selectedId ? ' map-region-item--active' : ''}`}
            onClick={() => onSelect(region.id)}
          >
            <span className="map-region-item__name">{region.name}</span>
            {region.place ? (
              <span className="map-region-item__place">{region.place.name}</span>
            ) : (
              <span className="map-region-item__unbound">{ui.maps.unbound}</span>
            )}
          </button>
        ))}
      </div>
    </div>
  );
}

// ── Main viewer component ─────────────────────────────────────────────

type Props = {
  map: MapViewerData;
  regions: MapRegionViewerData[];
};

export function MapViewer({ map, regions }: Props) {
  const [selectedId, setSelectedId] = useState<string | null>(null);

  // Respect displayOrder: lower numbers render first (appear behind higher ones).
  const sorted = [...regions].sort((a, b) => a.displayOrder - b.displayOrder);
  const selectedRegion = sorted.find((r) => r.id === selectedId) ?? null;

  function handleRegionClick(id: string) {
    setSelectedId((prev) => (prev === id ? null : id));
  }

  function handleCanvasClick(e: React.MouseEvent<SVGSVGElement>) {
    // Deselect only when clicking the bare canvas (not a region shape).
    if (e.target === e.currentTarget) {
      setSelectedId(null);
    }
  }

  return (
    <div className="map-viewer">
      {/* SVG canvas — coordinate space: viewBox="0 0 1000 1000" */}
      <div className="map-canvas">
        <svg
          viewBox="0 0 1000 1000"
          className="map-canvas__svg"
          preserveAspectRatio="xMidYMid meet"
          onClick={handleCanvasClick}
          aria-label={map.name}
        >
          <rect width="1000" height="1000" className="map-canvas__bg" />

          {sorted.map((region) => (
            <g
              key={region.id}
              className="map-region"
              onClick={(e) => {
                e.stopPropagation();
                handleRegionClick(region.id);
              }}
              tabIndex={0}
              role="button"
              aria-label={region.name}
              aria-pressed={region.id === selectedId}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  handleRegionClick(region.id);
                }
              }}
            >
              <RegionShape region={region} isSelected={region.id === selectedId} />
            </g>
          ))}
        </svg>
      </div>

      {/* Detail panel */}
      <div className="map-panel">
        {selectedRegion ? (
          <RegionDetail region={selectedRegion} />
        ) : (
          <div className="panel map-panel-hint">
            <p className="muted">
              {regions.length === 0 ? ui.maps.noRegions : ui.maps.selectRegion}
            </p>
          </div>
        )}

        <RegionList
          regions={sorted}
          selectedId={selectedId}
          onSelect={handleRegionClick}
        />
      </div>
    </div>
  );
}
