# Repo Structure

This is the current practical structure, not a speculative target tree.

```text
.
  app/                Next.js App Router routes and API handlers
  components/         Reusable UI building blocks
  features/           Entity-specific forms and slice UI
  lib/                Pure utilities and localization scaffolding
  prisma/             Database schema
  schemas/            Zod validation and shared request contracts
  server/             Server-side business logic and data access
  pages-preview/      Temporary GitHub Pages UX inspection layer
  docs/               Domain and architecture notes
```

## What Is Real Runtime
- `app/`, `features/`, `components/`, `server/`, `schemas/`, `lib/`, and `prisma/` are the real application foundation.
- Characters and Places are the currently stabilized vertical slices.
- Tags, Character<->Place links, and Search are active supporting features for the current slice.

## What Is Temporary
- `pages-preview/` is not the application runtime.
- It exists only as a static hosted preview surface when local execution is constrained.
- Preview code should stay small, coherent, and aligned with active MVP behavior.

## Current Organization Rules
- Keep route files in `app/` thin; business logic belongs in `server/`.
- Keep reusable UI in `components/ui/`; keep entity-specific form behavior in `features/`.
- Keep validation contracts in `schemas/` close to the API/service boundaries that use them.
- Keep localization text centralized in `lib/i18n/` rather than scattering hardcoded UI copy.

## Phase 2 Direction
- Do not let the folder layout imply Character is the center of the product.
- `Place` should be able to grow into the main geographic backbone without reorganizing the whole app again.
- Future map modules should stay separable from place records: maps are navigation surfaces, places are canonical world records.
- If place hierarchy grows, prefer adding dedicated place-focused modules instead of leaking hierarchy rules into generic helpers.
