# Relationship Rules

## Principles
- Use explicit relation tables for domain-important semantics.
- Use generic links only where the relationship is cross-cutting and does not deserve a dedicated table yet.
- Keep every relation typed, even if the type set starts small.
- Prefer one stored row per directed relationship; render bidirectional behavior in the app when needed.

## CharacterRelations
- Purpose: typed relationships between characters such as ally, sibling, rival, mentor, enemy, or parent.
- Directionality: directional in storage.
- Bidirectionality: inferred or paired, depending on relation type.
- Typing: required relation type string.
- Notes: use a dedicated table because character-to-character meaning is core to the app and needs strong querying.

## EntityLinks
- Purpose: generic entity-to-entity references that are meaningful but not yet worth a dedicated table.
- Directionality: directional in storage.
- Bidirectionality: optional and usually inferred by the UI.
- Typing: required relation type string plus optional role labels.
- Notes: this is a fallback relation table, not the primary place for every relationship in the system.

## EventParticipants
- Purpose: connect events to the entities involved in them.
- Directionality: directional from event to participant.
- Bidirectionality: not required; the event owns the relationship.
- Typing: participant role is required, such as witness, subject, attacker, speaker, or affected group.
- Notes: supports multiple participants with ordering or prominence metadata.

## StoryEntities
- Purpose: connect stories to the entities that appear in, influence, or anchor them.
- Directionality: directional from story to entity.
- Bidirectionality: not required; the story owns the relationship.
- Typing: required role such as protagonist, location, faction, event, or reference.
- Notes: keeps story membership explicit without forcing a story-specific graph model.

## PlaceConnections
- Purpose: typed connections between places such as contains, borders, travels-to, connected-by-road, or adjacent-to.
- Directionality: stored as directional, but some connection types may be rendered as bidirectional.
- Bidirectionality: inferred from type when appropriate.
- Typing: required connection type string.
- Notes: suitable for hierarchy, geography, and travel networks without baking map behavior into the UI.

## EntityTags
- Purpose: attach tags to any entity for filtering and grouping.
- Directionality: not directional.
- Bidirectionality: not applicable.
- Typing: the tag itself is the type.
- Notes: tags are classification, not semantic links.

## AssetLinks
- Purpose: attach assets to any entity as portraits, references, maps, source files, or supporting media.
- Directionality: directional from asset to entity or from entity to asset, but stored consistently one way.
- Bidirectionality: not required.
- Typing: required usage type such as cover, reference, attachment, or source.
- Notes: assets should never replace structured domain data.

## MapRegionLinks
- Purpose: connect regions to places or other entities they represent, reference, or visually annotate.
- Directionality: directional from region to target entity.
- Bidirectionality: not required.
- Typing: required link type such as primary-place, related-place, point-of-interest, or overlay-reference.
- Notes: a region can link to multiple targets, but the map renderer should still treat one target as the primary if needed.

## Extensibility Rules
- If a relation becomes central to querying or validation, promote it from EntityLinks into a dedicated table.
- If a relation needs strong referential integrity, do not keep it generic just for convenience.
- If a relation needs a new semantic category, add a new typed row rather than overloading a free-form note field.