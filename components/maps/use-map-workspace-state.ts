"use client";

import { useMemo, useState } from 'react';
import type {
  MapRegionViewerData,
  MapSurfaceEngine,
  MapWorkspaceMode,
} from '@/components/maps/types';

export function useMapWorkspaceState(regions: MapRegionViewerData[]) {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [activeLayer, setActiveLayer] = useState<string | null>(null);
  const [panelOpen, setPanelOpen] = useState(true);

  const engine: MapSurfaceEngine = 'svg';
  const mode: MapWorkspaceMode = 'explore';

  const layers = useMemo(() => {
    const seen = new Set<string>();
    for (const region of regions) {
      if (region.layerKey) {
        seen.add(region.layerKey);
      }
    }
    return [...seen].sort();
  }, [regions]);

  const visibleRegions = useMemo(() => {
    const sortedRegions = [...regions].sort((a, b) => a.displayOrder - b.displayOrder);
    if (!activeLayer) {
      return sortedRegions;
    }
    return sortedRegions.filter((region) => region.layerKey === activeLayer);
  }, [regions, activeLayer]);

  const selectedRegion = visibleRegions.find((region) => region.id === selectedId) ?? null;

  function toggleRegion(id: string) {
    setSelectedId((currentId) => (currentId === id ? null : id));
  }

  function clearSelection() {
    setSelectedId(null);
  }

  function changeLayer(layer: string | null) {
    setActiveLayer(layer);
    setSelectedId(null);
  }

  function togglePanel() {
    setPanelOpen((isOpen) => !isOpen);
  }

  return {
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
  };
}
