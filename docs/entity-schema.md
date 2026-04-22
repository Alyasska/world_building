# Entity Schema Draft

## Shared Base Fields
These fields apply to most entities unless noted otherwise.

| field name | type | required/optional | default value | notes |
| --- | --- | --- | --- | --- |
| id | uuid | required | generated | Stable primary key, lowercase UUID string. |
| name / title | string | required | none | Use `name` for people, places, factions, tags, assets, and regions; use `title` for stories, events, lore entries, and rule systems. |
| slug | string | required | generated from name/title | Human-readable, unique within the entity type and world. |
| summary | string | optional | null | Short plain-text summary for lists and previews. |
| content | json | optional | null | Rich text document or structured long-form notes. Keep editor format abstracted from the domain. |
| status | enum | required | `draft` | Content lifecycle state. |
| canonState | enum | required | `canonical` | Canonicality state for the record. |
| metadata | json | optional | `{}` | Entity-specific extension data that does not deserve a first-class column yet. |
| createdAt | datetime | required | now() | Creation timestamp. |
| updatedAt | datetime | required | auto-update | Last modification timestamp. |
| deletedAt | datetime | optional | null | Soft-delete marker. |

## Character
| field name | type | required/optional | default value | notes |
| --- | --- | --- | --- | --- |
| aliases | json | optional | `[]` | Alternate names, pseudonyms, or spellings. |
| pronouns | string | optional | null | Free-form unless later normalized. |
| epithet | string | optional | null | Short descriptive label or honorific. |
| birthDateText | string | optional | null | Human-readable uncertain date. |
| deathDateText | string | optional | null | Human-readable uncertain date. |

## Place
| field name | type | required/optional | default value | notes |
| --- | --- | --- | --- | --- |
| placeKind | string | optional | null | City, region, room, landmark, and similar labels. |
| locationText | string | optional | null | Free-form location note when geometry is not enough. |
| aliases | json | optional | `[]` | Alternate place names. |

## Story
| field name | type | required/optional | default value | notes |
| --- | --- | --- | --- | --- |
| storyKind | string | optional | null | Arc, chapter, quest line, campaign, and similar labels. |
| startDateText | string | optional | null | Human-readable start marker. |
| endDateText | string | optional | null | Human-readable end marker. |

## Event
| field name | type | required/optional | default value | notes |
| --- | --- | --- | --- | --- |
| eventDateText | string | optional | null | Human-readable event date or date range. |
| startAt | datetime | optional | null | Structured start timestamp if known. |
| endAt | datetime | optional | null | Structured end timestamp if known. |
| datePrecision | enum | optional | `unknown` | Suggested values: `exact`, `day`, `month`, `year`, `range`, `circa`, `unknown`. |

## Faction
| field name | type | required/optional | default value | notes |
| --- | --- | --- | --- | --- |
| factionKind | string | optional | null | Political, guild, religion, house, order, etc. |
| emblemAssetId | uuid | optional | null | Optional primary symbol or banner asset. |

## LoreEntry
| field name | type | required/optional | default value | notes |
| --- | --- | --- | --- | --- |
| entryKind | string | optional | null | Myth, custom, background fact, cultural note, etc. |
| topic | string | optional | null | Small grouping label for browsing. |

## RuleSystem
| field name | type | required/optional | default value | notes |
| --- | --- | --- | --- | --- |
| systemKind | string | optional | null | Magic, tech, economy, biology, religion, etc. |
| versionLabel | string | optional | null | Human-readable version or revision label. |
| appliesTo | string | optional | null | Short scope note if the system is localized. |

## Asset
| field name | type | required/optional | default value | notes |
| --- | --- | --- | --- | --- |
| assetKind | enum | required | `other` | Suggested values: `image`, `document`, `audio`, `video`, `archive`, `other`. |
| storageKey | string | required | none | Stable storage path or object key. |
| fileName | string | required | none | Original or exported filename. |
| mimeType | string | required | none | MIME type of the file. |
| byteSize | bigint | optional | null | File size if known. |
| checksum | string | optional | null | Integrity hash for portability checks. |
| altText | string | optional | null | Accessibility or reference text for images. |
| sourceUri | string | optional | null | Optional external source reference. |

## Tag
| field name | type | required/optional | default value | notes |
| --- | --- | --- | --- | --- |
| color | string | optional | null | Optional display hint only. |
| namespace | string | optional | `world` | Allows future separation of tag vocabularies. |

## MapRegion
| field name | type | required/optional | default value | notes |
| --- | --- | --- | --- | --- |
| mapKey | string | required | `main` | Identifies the map or overlay this region belongs to. |
| layerKey | string | required | `base` | Logical layer name for future overlays. |
| geometryType | enum | required | none | Suggested values: `point`, `rect`, `polygon`. |
| geometry | json | required | none | Normalized coordinates or polygon data used by the renderer. |
| labelPoint | json | optional | null | Optional point for label placement. |
| displayOrder | int | optional | 0 | Render order when regions overlap. |

## Notes
- Partial data is valid. Unknown values stay null rather than using invented placeholders.
- Rich text content should stay in a structured format so exports and future editors do not depend on HTML.
- Shared base fields are intentionally uniform so every entity can be exported, searched, and versioned the same way.