# Current Scope

Last updated: 2026-04-23. Reflects the real working slice after Phase 3.

## Real Current State

- Single-user private worldbuilding app.
- Full-stack TypeScript: Next.js App Router, React, Prisma, PostgreSQL.
- Full Prisma schema migrated and live. All core narrative entities have service + API layers.
- Working CRUD for: Character, Place, Story, Event, Tag.
- Cross-entity features: EntityLink manager, EventParticipant manager, Place chronology, global search.
- Static SVG map viewer linked to Place records (read-only, no editor yet).
- Russian-first i18n (`lib/i18n/ui.ts`) with English fallback.
- Soft-delete, status, and canon-state on all entities by design.
- Vercel deployment ready (postinstall prisma generate, migration SQL tracked).

## Schema Present But No UI Yet

- Faction, LoreEntry, RuleSystem — modeled, migrated, no CRUD pages.
- Asset — modeled, migrated, no upload/storage logic.
- PlaceConnection — modeled, migrated, no UI.
- CharacterRelation — modeled, migrated, no UI.
- StoryEntity — modeled, migrated, service scaffold reserved.
- MapRegion editor — viewer only, no drawing or region creation in UI.

## Not In The Current Working Slice

- Faction / LoreEntry / RuleSystem / Asset CRUD pages.
- Place connection UI (route and travel data between places).
- Character relation UI (typed character-to-character links).
- Map region creation or editing tools.
- Map layers (topographic, political, narrative overlays).
- Timeline, graph, or relational visualization views.
- Export/import (JSON, Markdown, portability layer).
- Multi-user, auth, permissions, comments.
- AI-assisted canon generation.

## Phase 4 Target Direction

- Faction CRUD as the next vertical slice (mirrors Character pattern).
- LoreEntry CRUD (knowledge base / encyclopedia entries).
- Place connections UI (distance, travel time, connection type).
- Map region editor (add/edit point, rect, polygon regions on a map).
- Possibly: Character relations UI and character-to-character graph surface.

## Boundary Rules

- Preserve stable domain model and reusable patterns before adding surface area.
- Place is the canonical location entity — hierarchy grows from `parentPlaceId`.
- Map regions point into Place records; maps are navigation, not data.
- Prefer incremental vertical slices over broad speculative branches.
- Do not expose `slug` as a primary user-facing concept.
