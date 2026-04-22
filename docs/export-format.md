# Export Format

## Export Goals
- Stable across UI changes.
- Portable outside the application.
- Easy to diff, back up, and restore.
- Self-describing enough to survive long-term storage.

## Entity Export Shape
Every entity export should use the same envelope.

```json
{
  "schemaVersion": "1.0",
  "entityType": "character",
  "entityId": "uuid",
  "exportedAt": "2026-04-22T00:00:00.000Z",
  "data": {},
  "relations": {},
  "assets": [],
  "metadata": {}
}
```

## Entity-Specific Payload Rules
- `data` contains the entity record itself, including shared fields and entity-specific fields.
- `relations` contains arrays keyed by relation family, such as `characterRelations`, `entityLinks`, or `mapRegionLinks`.
- `assets` contains lightweight references to attached files, not embedded binaries.
- `metadata` carries export-level notes, such as source world name or export mode.

## Full-World Export Folder Structure
```text
export/<world-slug>/<export-timestamp>/
  manifest.json
  world.json
  entities/
    characters/
    places/
    stories/
    events/
    factions/
    lore-entries/
    rule-systems/
    assets/
    tags/
    map-regions/
  relations/
    character-relations/
    entity-links/
    event-participants/
    story-entities/
    place-connections/
    entity-tags/
    asset-links/
    map-region-links/
  files/
```

## Folder Rules
- One JSON file per entity record keeps backups easy to inspect and diff.
- Relation files can be separated from entity files so large exports stay navigable.
- Asset binaries should live beside export metadata but outside the JSON records.
- File names should use IDs, not titles, so exports stay stable if names change.

## Portability Rules
- Exports must preserve IDs, slugs, and canonical states.
- Exports must not depend on current route paths or UI labels.
- Imported data should be able to restore the same relational meaning even if presentation changes later.
- Any future migration format should be able to read this export without needing browser state.