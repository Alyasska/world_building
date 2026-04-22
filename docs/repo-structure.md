# Repo Structure Proposal

```text
.
  app/
    api/
    (routes)/
  components/
    ui/
    shared/
  features/
    characters/
    places/
    stories/
    events/
    factions/
    lore/
    rules/
    assets/
    tags/
    map/
  server/
    db/
    queries/
    mutations/
    exports/
    import/
  schemas/
    zod/
    types/
  lib/
    dates/
    ids/
    slugs/
    strings/
    files/
  prisma/
  assets/
    source/
    icons/
    maps/
  exports/
    samples/
    backups/
  docs/
```

## Structure Rules
- `app/` holds route segments and route handlers only.
- `components/` holds reusable presentational components.
- `features/` holds domain-specific UI and client/server glue for each entity area.
- `server/` holds database access, export logic, import logic, and server-only business operations.
- `schemas/` holds validation schemas and shared type definitions.
- `lib/` holds pure utilities with no framework dependency.
- `prisma/` holds the database schema and migration history.
- `assets/` holds checked-in source assets, not uploaded production files.
- `exports/` holds sample exports, backup fixtures, and portable snapshots.
- `docs/` holds the foundational product and schema documents.

## Scaling Rules
- Add new domain features under `features/` instead of growing the route tree into a business-logic dump.
- Keep database code isolated so UI changes do not ripple into the domain model.
- Keep schema validation close to the data contracts that use it.
- Keep map code separate from place code so future overlays stay modular.