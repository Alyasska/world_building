# Domain Model

## Character
Represents a person or sentient actor in the world. Characters can be linked to factions, stories, events, places, assets, and other characters through explicit relations.

## Place
Represents a physical or conceptual location such as a continent, region, country, city, district, room, or landmark. Places are the authoritative source for location meaning; map regions only point to them.

Places also form a parent-child hierarchy. That hierarchy is the backbone for future drilldown navigation such as continent -> region -> country -> city -> village -> district.

## Story
Represents an ordered narrative container such as an arc, chapter, quest line, or campaign segment. Stories group entities that matter together without collapsing them into one timeline table.

## Event
Represents a dated or partially dated occurrence in the world. Events are the core unit for “something happened” and can reference participants, places, and related lore.

## Faction
Represents a political, social, religious, military, or informal group. Factions help organize belonging, conflict, and alignment across characters, places, and events.

## LoreEntry
Represents a reusable fact, principle, custom, myth, or background note. Lore entries are the place for world knowledge that is not better modeled as a character, place, event, or rule.

## RuleSystem
Represents a codified system such as magic, technology, economics, biology, religion, or other world rules. Rule systems exist to keep mechanics explicit and distinct from narrative lore.

## Asset
Represents a stored file or media item such as an image, map, document, or reference file. Assets are attachable to any entity without becoming the source of truth for the entity itself.

## Tag
Represents a lightweight classification label. Tags are for filtering and grouping, not for semantic relationships.

## MapRegion
Represents a clickable or renderable region on one or more static maps. A region is a spatial index over the world, not the place itself.

## Map-First But Data-Driven
The app is map-first because regions are a primary entry point into the world and a primary navigation surface. It is still data-driven because the map never owns canonical world meaning: a region points to places and other entities, while the underlying relational records remain authoritative.

This keeps the map layer modular. The same place can be surfaced from search, relation views, exports, or future overlays without changing what the place means in storage.
