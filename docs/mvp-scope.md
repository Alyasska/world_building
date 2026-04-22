# MVP Scope

## Included
- Single-user private worldbuilding app.
- Full-stack TypeScript with Next.js App Router and PostgreSQL.
- Core entity management for Character, Place, Story, Event, Faction, LoreEntry, RuleSystem, Asset, Tag, and MapRegion.
- Create, edit, archive, and soft-delete flows for entities and relations.
- Structured fields for searchable facts plus rich text content for narrative detail.
- Tags and explicit entity links.
- Static world map with clickable regions wired to data, not page-specific code.
- File-backed media asset storage.
- JSON export for a single entity and for the full world.
- Draft, active, and archived content states.
- Canonical, alternate, and uncertain canon tracking.

## Explicitly Out Of Scope
- Multi-user collaboration, permissions, comments, and approvals.
- AI-generated canon, AI worldbuilding, or autonomous content creation.
- Procedural generation of geography, characters, events, or lore.
- Advanced timeline engines, relationship graph visualizations, and simulation systems.
- Dynamic terrain rendering, topographic layers, and generated map pipelines.
- Complex workflow automation, notifications, and external integrations.
- Import from external apps unless needed later for migration.
- Mobile-native apps and offline-first sync.

## MVP Boundary Rules
- If a feature changes canon meaning or introduces new relationship semantics, it is not MVP.
- If a feature requires a new domain entity, relation class, or export shape, it is not MVP unless defined in this foundation.
- If a feature is only a presentation choice, it stays out of this scope and can evolve later without changing stored data.