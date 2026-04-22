# ERD Note

The ERD should be centered on the core entity tables, with relation tables around them instead of one giant polymorphic table. CharacterRelations and PlaceConnections are dedicated because they carry strong domain meaning. EventParticipants, StoryEntities, EntityTags, AssetLinks, and MapRegionLinks are attachment-style tables that keep the main entities clean while still allowing many-to-many structure.

MapRegion points into the domain model rather than replacing it. Place remains the source of truth for location meaning, and MapRegionLink exists so the map can stay data-driven. EntityLinks is intentionally generic and should only be used when no dedicated relation table is appropriate.