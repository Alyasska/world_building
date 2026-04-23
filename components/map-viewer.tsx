"use client";

import Link from 'next/link';
import { getUiText } from '@/lib/i18n/ui';
import { MapSurface } from '@/components/maps/map-surface';
import type { MapRegionViewerData, MapViewerData } from '@/components/maps/types';
import { useMapWorkspaceState } from '@/components/maps/use-map-workspace-state';

const ui = getUiText();

export type { MapRegionViewerData, MapViewerData } from '@/components/maps/types';

function MapTopbar({
  map,
  layers,
  activeLayer,
  onLayerChange,
  panelOpen,
  onTogglePanel,
}: {
  map: MapViewerData;
  layers: string[];
  activeLayer: string | null;
  onLayerChange: (layer: string | null) => void;
  panelOpen: boolean;
  onTogglePanel: () => void;
}) {
  return (
    <div className="map-topbar">
      <div className="map-topbar__title">
        <span className="map-topbar__name">{map.name}</span>
        {map.mapKind ? (
          <span className="map-topbar__kind">{map.mapKind}</span>
        ) : null}
      </div>

      {layers.length > 1 ? (
        <div className="map-topbar__layers">
          <button
            type="button"
            className={`map-layer-btn${activeLayer === null ? ' map-layer-btn--active' : ''}`}
            onClick={() => onLayerChange(null)}
          >
            {ui.maps.allLayers}
          </button>
          {layers.map((layer) => (
            <button
              key={layer}
              type="button"
              className={`map-layer-btn${activeLayer === layer ? ' map-layer-btn--active' : ''}`}
              onClick={() => onLayerChange(layer)}
            >
              {layer}
            </button>
          ))}
        </div>
      ) : null}

      <div className="map-topbar__actions">
        <Link href="/maps" className="map-topbar__link">
          {ui.maps.title}
        </Link>
        <Link href="/world" className="map-topbar__link">
          {ui.world.title}
        </Link>
        <button
          type="button"
          className={`map-topbar__toggle${panelOpen ? ' map-topbar__toggle--active' : ''}`}
          onClick={onTogglePanel}
          aria-label={ui.maps.regionList}
        >
          {ui.maps.regionList}
        </button>
      </div>
    </div>
  );
}

function RegionInspector({
  region,
  onClose,
}: {
  region: MapRegionViewerData;
  onClose: () => void;
}) {
  return (
    <div className="map-inspector">
      <div className="map-inspector__head">
        <p className="map-inspector__eyebrow">{region.layerKey}</p>
        <h2 className="map-inspector__name">{region.name}</h2>
        <button
          type="button"
          className="map-inspector__close"
          onClick={onClose}
          aria-label="Close"
        >
          x
        </button>
      </div>

      {region.summary ? (
        <p className="map-inspector__summary">{region.summary}</p>
      ) : null}

      {region.place ? (
        <div className="map-inspector__place">
          <p className="map-inspector__place-scale">{region.place.placeScale}</p>
          <p className="map-inspector__place-name">{region.place.name}</p>
          <div className="map-inspector__actions">
            <Link href={`/places/${region.place.id}`} className="button-link">
              {ui.maps.openPlace}
            </Link>
            <Link href={`/world/${region.place.id}`} className="button-link">
              {ui.maps.explorePlace}
            </Link>
          </div>
        </div>
      ) : (
        <p className="map-inspector__unbound">{ui.maps.unbound}</p>
      )}
    </div>
  );
}

function RegionListPanel({
  regions,
  selectedId,
  onSelect,
}: {
  regions: MapRegionViewerData[];
  selectedId: string | null;
  onSelect: (id: string) => void;
}) {
  return (
    <div className="map-region-list-panel">
      <div className="map-region-list-panel__header">
        <h3 className="map-region-list-panel__title">{ui.maps.regionList}</h3>
        <span className="muted" style={{ fontSize: '0.78rem' }}>{regions.length}</span>
      </div>
      {regions.length === 0 ? (
        <p className="muted" style={{ padding: '8px 0', fontSize: '0.85rem' }}>{ui.maps.noRegions}</p>
      ) : (
        <div className="map-region-list-panel__list">
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
      )}
    </div>
  );
}

type Props = {
  map: MapViewerData;
  regions: MapRegionViewerData[];
};

export function MapViewer({ map, regions }: Props) {
  const {
    engine,
    mode,
    layers,
    panelOpen,
    activeLayer,
    visibleRegions,
    selectedId,
    selectedRegion,
    toggleRegion,
    clearSelection,
    changeLayer,
    togglePanel,
  } = useMapWorkspaceState(regions);

  return (
    <div className="map-viewer">
      <MapTopbar
        map={map}
        layers={layers}
        activeLayer={activeLayer}
        onLayerChange={changeLayer}
        panelOpen={panelOpen}
        onTogglePanel={togglePanel}
      />

      <MapSurface
        engine={engine}
        mode={mode}
        map={map}
        regions={visibleRegions}
        selectedId={selectedId}
        onRegionSelect={toggleRegion}
        onCanvasClear={clearSelection}
      />

      <div className={`map-panel${panelOpen ? '' : ' map-panel--hidden'}`}>
        {selectedRegion ? (
          <RegionInspector
            region={selectedRegion}
            onClose={clearSelection}
          />
        ) : (
          <div className="map-inspector map-inspector--hint">
            <p className="muted">
              {visibleRegions.length === 0 ? ui.maps.noRegions : ui.maps.selectRegion}
            </p>
          </div>
        )}

        <RegionListPanel
          regions={visibleRegions}
          selectedId={selectedId}
          onSelect={toggleRegion}
        />
      </div>
    </div>
  );
}
