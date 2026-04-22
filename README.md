# World Building App

Private long-term worldbuilding system built with Next.js App Router, React, Prisma, and PostgreSQL.

## What Is Current
- The real application lives in `app/`, `server/`, `schemas/`, `features/`, `components/`, `lib/`, and `prisma/`.
- The active working slice is Phase 1 foundation: Dashboard, Characters, Places, Tags, basic Character<->Place links, and Search.
- UI text is centralized in `lib/i18n/ui.ts` with Russian-first defaults and English fallback.

## What Is Temporary
- `pages-preview/` is a static GitHub Pages surface used only for visual UX review when local runtime constraints make browser verification harder.
- It is intentionally mock-driven and should not be treated as the source of truth for backend behavior or architecture.

## Architectural Direction
- Structured relational data stays separate from flexible long-form `content`.
- `Place` is the canonical location entity.
- Map-facing systems are meant to point into place data rather than replace it.
- Phase 2 is expected to shift the product toward a Place-first, map-first navigation model.

## Useful Starting Points
- Runtime shell: `app/layout.tsx`
- Dashboard: `app/page.tsx`
- Character slice: `app/characters`, `features/characters`, `server/character-service.ts`
- Place slice: `app/places`, `features/places`, `server/place-service.ts`
- Preview layer: `pages-preview/`
- Scope and structure notes: `docs/`
