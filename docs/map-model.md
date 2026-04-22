# Map Model

## What A MapRegion Is
A MapRegion is a data-defined clickable shape or point on a static map. It is a spatial record with enough geometry for rendering and enough metadata for linking to world entities.

## Relation To Place And Other Entities
- The region is not the place itself.
- A place is the canonical world concept; a region is the visual or navigational representation.
- One region can point to one primary place and optionally additional related entities through MapRegionLinks.
- The same place may appear in more than one region if the app later supports multiple maps or overlays.

## Minimal MVP Data
- Region identity: id, name, slug.
- Map placement: mapKey, layerKey, geometryType, geometry.
- Optional label placement: labelPoint.
- Search and display helpers: summary, status, canonState, metadata.

## Modular Map Rules
- Keep geometry data separate from page logic.
- Keep map rendering code generic so future overlays can reuse the same region records.
- Store coordinates in a normalized map space rather than hard-coding them to a specific UI component.
- Allow future map layers such as political, terrain, travel, hazard, or event overlays without changing the meaning of MapRegion.

## Future Expansion Compatibility
- Additional overlays can reuse MapRegion with a new layerKey instead of creating a new map entity.
- Generated maps, topographic layers, and annotated views can be added later as render-time concerns.
- Region records should remain stable even if the visual map asset changes.