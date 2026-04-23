# World Building App

Private long-term worldbuilding system built with Next.js App Router, React, Prisma, and PostgreSQL.

## Current Stage — Phase 3 Complete (Map Viewer + Full Entity CRUD)

As of 2026-04-23 the app has a working full-stack runtime with CRUD for all primary narrative entities, a relational data model fully migrated in PostgreSQL, and a static visual map viewer.

### What Is Working

**Entities with full CRUD UI + API:**
- Characters (aliases, pronouns, epithet, birth/death dates, status, canon state)
- Places (scale, kind, parent-place hierarchy, location text, aliases)
- Stories (kind, primary place, date range, story entities)
- Events (date text + ISO precision, place, story, participants)
- Tags (color, namespace, tag manager UI on every entity)

**Cross-cutting features:**
- EntityLink manager — attach any entity to any other with a typed relation
- EventParticipant manager — attach Characters/Factions/etc. to Events with roles and sequence
- Place chronology — timeline of events that occurred at a place
- Global search across all entity types (`/search`)
- World Explorer component (relationship graph surface — scaffolded)
- Maps list + static SVG map viewer (`/maps`, `/maps/[id]`)
  - Point, Rect, Polygon geometry rendered in a 1000×1000 coordinate space
  - Clicking a region shows a detail panel with a link to the Place record
- Russian-first i18n with English fallback (`lib/i18n/ui.ts`)
- Soft-delete, status (draft/active/archived), and canon-state on all entities

**Infrastructure:**
- Full Prisma schema with PostgreSQL migration (`prisma/migrations/20260423000000_init/migration.sql`)
- `postinstall` hook runs `prisma generate` for Vercel deployments
- Zod schemas for all API inputs (`schemas/`)
- Service layer cleanly separated from route handlers (`server/`)

### Schema Models

| Model | UI | Service | API |
|---|---|---|---|
| Character | ✅ | ✅ | ✅ |
| Place | ✅ | ✅ | ✅ |
| Story | ✅ | ✅ | ✅ |
| Event | ✅ | ✅ | ✅ |
| Tag | ✅ | ✅ | ✅ |
| Map | List only | ✅ | ✅ |
| MapRegion | Viewer only | ✅ | ✅ |
| EntityLink | Manager UI | ✅ | ✅ |
| EventParticipant | Manager UI | ✅ | ✅ |
| PlaceConnection | Schema only | — | — |
| CharacterRelation | Schema only | — | — |
| StoryEntity | Schema only | — | — |
| Faction | Schema only | — | — |
| LoreEntry | Schema only | — | — |
| RuleSystem | Schema only | — | — |
| Asset | Schema only | — | — |

### What Is Not Yet Built

- Faction, LoreEntry, RuleSystem, Asset CRUD
- Place connection UI (route between places)
- Character relation UI (character-to-character typed links)
- Map region editor / drawing tools (viewer is read-only)
- Map layers (topographic, political, narrative overlays)
- Timeline / graph views
- Export/import (JSON, Markdown)
- Multi-user, auth, permissions

### Architectural Direction

- `Place` is the canonical location entity. Hierarchy grows from `parentPlaceId`, not from a separate table.
- Map regions point into Place records — maps are a navigation surface, not a data replacement.
- Structured relational fields stay separate from flexible `content` (Json) fields.
- Every entity has `status`, `canonState`, `deletedAt` — designed for draft states and alternate canon from the start.
- Phase 4 target: Faction + LoreEntry CRUD, Place connections UI, and map region editor.

## Encoding Convention

All source files are **UTF-8 without BOM**. The app is Russian-first — Cyrillic strings are throughout `lib/i18n/ui.ts`. Mojibake (encoding corruption) looks like repeating `Р`/`С` sequences, e.g. `'РСЃС‚РѕСЂРёРё'` instead of `'Истории'`. This happens when UTF-8 Cyrillic bytes (`D0 xx`, `D1 xx`) are re-read as Windows-1251 characters. Never paste text from a Windows terminal into source files. See `CLAUDE.md` for detection and prevention rules.

## Project Layout

```
app/            Next.js App Router pages and API routes
server/         Service layer (business logic, Prisma queries)
features/       Form components per entity
components/     Shared UI components (map-viewer, site-nav, world-explorer, ui/*)
schemas/        Zod validation schemas
lib/            Utilities (i18n, form helpers, geometry, place-scale, event-date-precision)
prisma/         Schema + migrations
docs/           Architecture and design notes
pages-preview/  Static GitHub Pages UX preview (mock-driven, not source of truth)
```

## Useful Entry Points

- Runtime shell: `app/layout.tsx`
- Dashboard: `app/page.tsx`
- Character slice: `app/characters/`, `features/characters/`, `server/character-service.ts`
- Place slice: `app/places/`, `features/places/`, `server/place-service.ts`
- Story slice: `app/stories/`, `features/stories/`, `server/story-service.ts`
- Event slice: `app/events/`, `features/events/`, `server/event-service.ts`
- Map viewer: `components/map-viewer.tsx`, `app/maps/`
- i18n: `lib/i18n/ui.ts`
- Docs: `docs/`
