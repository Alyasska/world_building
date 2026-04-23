# Current Scope

This document describes the real working slice at the end of Phase 1, not the full long-term dream scope.

## Real Current Foundation
- Single-user private worldbuilding app.
- Full-stack TypeScript with Next.js App Router, React, Prisma, and PostgreSQL.
- Working runtime shell with Dashboard, Characters, Places, Tags, Character↔Place links, and simple Search.
- Centralized UI strings with Russian-first defaults and an English fallback path.
- Structured relational records kept separate from flexible `content`/metadata fields.
- Soft-delete, status, and canon-state handling for active runtime entities.
- Temporary GitHub Pages preview surface for UX inspection only.

## Foundation Still Present But Not Active UI
- Broader Prisma/domain scaffolding for Story, Event, Faction, LoreEntry, RuleSystem, Asset, Tag, and MapRegion.
- Relation rules and map-model notes that inform later phases.
- Export/import and extended map ideas as forward-looking documentation, not active product behavior.

## Not In The Current Working Slice
- Story CRUD and story-centered navigation.
- Map rendering, region CRUD, overlays, or clickable world navigation.
- Dedicated place hierarchy UX.
- Timeline, graph, export/import, or procedural systems.
- Multi-user collaboration, permissions, or comments.
- AI-assisted canon generation or autonomous content creation.

## Phase 2 Preparation Direction
- Place becomes the backbone entity for geographic organization.
- Hierarchy such as continent -> region -> country -> city -> village -> district should grow from `Place`, not from temporary UI assumptions.
- Map-first navigation should remain data-driven: map regions point to place records rather than replacing them.

## Boundary Rules
- Preserve the stable domain model and reusable patterns before adding new surface area.
- Avoid exposing implementation details such as slug as the primary user-facing concept.
- Prefer incremental vertical slices over broad speculative feature branches.
