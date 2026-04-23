# Claude Code — Project Rules

## File Encoding

**All source files in this project are UTF-8 without BOM.**

This is a Russian-first application. Cyrillic strings appear throughout `lib/i18n/ui.ts` and other files. Mojibake (encoding corruption) has occurred before and is easy to introduce on Windows.

### How to detect mojibake

A Cyrillic string is corrupted if it contains repeating sequences of `Р`, `С`, `Р` (Cyrillic R and S) interleaved with Latin or punctuation characters. Example of bad vs good:

```
BAD:  'РСЃС‚РѕСЂРёРё'    — mojibake
GOOD: 'Истории'          — correct UTF-8 Russian
```

The root cause: UTF-8 Cyrillic bytes (`D0 xx`, `D1 xx`) were re-interpreted as Windows-1251 characters, where `D0` = `Р` and `D1` = `С`.

### Rules

- When writing or editing any string in `lib/i18n/ui.ts`, verify that Russian strings contain only real Cyrillic characters (А–Я, а–я, ё, Ё), not Р/С sequences mixed with Latin.
- Never copy-paste text from a terminal or tool output window into source files — terminal rendering can misinterpret UTF-8 as Windows-1251 and display (and copy) the wrong characters.
- If you must write Russian strings programmatically (e.g. via PowerShell), use `[System.IO.File]::WriteAllText(..., New-Object System.Text.UTF8Encoding $false)` to write UTF-8 without BOM.
- After editing `lib/i18n/ui.ts`, run `grep -P "[\x{0420}\x{0421}]{2}" lib/i18n/ui.ts` to spot consecutive Р/С sequences that indicate mojibake. Any match in a Russian string is a bug.

## i18n Structure

UI strings live in `lib/i18n/ui.ts`. The file exports `getUiText()` which merges several `const` blocks:

- `uiText` — core strings (characters, places, tags, search, common)
- `narrativeUiText` — stories, events, and their cross-references on world/place pages
- `worldUiText` — world explorer and atlas navigation
- `mapUiText` — map viewer strings

Both `ru` and `en` locales must be kept in sync when adding new keys. Russian is the default locale; English is the fallback.

## TypeScript

- Run `npx tsc --noEmit` before committing to catch type errors early.
- JSON fields in Prisma update operations must use `toJsonWrite()` from `lib/prisma-json.ts` when passing `existing.someJsonField` (which has type `JsonValue | null`) — raw `null` is not assignable to `NullableJsonNullValueInput`.
- Service `update*` functions that return types with relation fields use fetch-after-write (call `getXxx(id)` after the update query) to avoid Prisma type inference limitations with relation selects.

## Architecture Reminders

- `Place` is the canonical location entity. Do not create alternative location systems.
- Map regions point into Place records; they are a navigation surface, not a data replacement.
- Structured relational fields stay separate from the flexible `content: Json` field on every entity.
- Every entity has `status`, `canonState`, and `deletedAt` — use them, do not add separate boolean flags.
