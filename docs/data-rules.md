# Data Rules

## ID Format
- Use UUIDs as primary keys.
- Store IDs as lowercase canonical strings in exports and APIs.
- Never encode meaning into the ID itself.

## Slug Rules
- Slugs are lowercase, ASCII, and hyphen-separated.
- Slugs are unique within the entity type and world.
- Slugs may change if the display name changes, but the ID never changes.
- Slugs are for readability and URLs, not identity.

## Status Values
- `draft`: work in progress, not yet treated as final.
- `active`: usable and visible in normal workflows.
- `archived`: kept for reference but not part of the default working set.

## Canon State Values
- `canonical`: part of the primary world truth.
- `alternate`: an accepted alternate continuity or variant.
- `uncertain`: known but not fully verified.
- `noncanonical`: intentionally outside the current canon.

## Deletion Behavior
- Default behavior is soft delete.
- Soft-deleted records keep their IDs and exports unless a later hard purge removes them.
- Hard delete is reserved for explicit maintenance or data removal workflows.
- Relations pointing at soft-deleted entities should remain intact for historical export unless purged together.

## Date Uncertainty Handling
- Use structured timestamps when exact values are known.
- Use text fields when only a human-readable estimate exists.
- Prefer a date range or precision flag over inventing exact timestamps.
- Keep uncertainty explicit in the data rather than hiding it in prose.

## Nullable And Partial Data
- Null means unknown, not applicable, or not yet entered.
- Empty strings should not be used as a substitute for null.
- Partial records are valid and should still export cleanly.
- Missing data should not block creation of an entity.

## Tags Versus Links
- Tags are classification labels.
- Links are explicit relationships with semantics.
- If the meaning is “this is related to that,” use a link.
- If the meaning is “this should group with these,” use a tag.

## Structured Fields Versus Rich Text Content
- Structured fields hold queryable facts and stable meaning.
- Rich text content holds narrative prose, notes, and long-form explanation.
- Do not store important facts only inside content if they need to be filtered, exported, or linked.
- Content format should remain editor-agnostic at the domain level.

## Metadata Use
- Metadata is for low-frequency extensions and app-specific hints.
- Metadata must not replace a missing core field when the data is important.
- If a metadata key becomes broadly useful, promote it to a real column or relation.