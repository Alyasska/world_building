-- CreateEnum
CREATE TYPE "EntityStatus" AS ENUM ('draft', 'active', 'archived');

-- CreateEnum
CREATE TYPE "CanonState" AS ENUM ('canonical', 'alternate', 'uncertain', 'noncanonical');

-- CreateEnum
CREATE TYPE "AssetKind" AS ENUM ('image', 'document', 'audio', 'video', 'archive', 'other');

-- CreateEnum
CREATE TYPE "MapGeometryType" AS ENUM ('point', 'rect', 'polygon');

-- CreateEnum
CREATE TYPE "PlaceScale" AS ENUM ('world', 'continent', 'region', 'country', 'province', 'state', 'city', 'town', 'village', 'district', 'landmark', 'building', 'room', 'site', 'other');

-- CreateTable
CREATE TABLE "Character" (
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "summary" TEXT,
    "content" JSONB,
    "status" "EntityStatus" NOT NULL DEFAULT 'draft',
    "canonState" "CanonState" NOT NULL DEFAULT 'canonical',
    "metadata" JSONB,
    "aliases" JSONB,
    "pronouns" TEXT,
    "epithet" TEXT,
    "birthDateText" TEXT,
    "deathDateText" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "Character_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Place" (
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "summary" TEXT,
    "content" JSONB,
    "status" "EntityStatus" NOT NULL DEFAULT 'draft',
    "canonState" "CanonState" NOT NULL DEFAULT 'canonical',
    "metadata" JSONB,
    "placeScale" "PlaceScale" NOT NULL DEFAULT 'other',
    "placeKind" TEXT,
    "parentPlaceId" UUID,
    "locationText" TEXT,
    "aliases" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "Place_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Story" (
    "id" UUID NOT NULL,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "summary" TEXT,
    "content" JSONB,
    "status" "EntityStatus" NOT NULL DEFAULT 'draft',
    "canonState" "CanonState" NOT NULL DEFAULT 'canonical',
    "metadata" JSONB,
    "storyKind" TEXT,
    "primaryPlaceId" UUID,
    "startDateText" TEXT,
    "endDateText" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "Story_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Event" (
    "id" UUID NOT NULL,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "summary" TEXT,
    "content" JSONB,
    "status" "EntityStatus" NOT NULL DEFAULT 'draft',
    "canonState" "CanonState" NOT NULL DEFAULT 'canonical',
    "metadata" JSONB,
    "storyId" UUID,
    "placeId" UUID,
    "eventDateText" TEXT,
    "startAt" TIMESTAMP(3),
    "endAt" TIMESTAMP(3),
    "datePrecision" TEXT DEFAULT 'unknown',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "Event_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Faction" (
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "summary" TEXT,
    "content" JSONB,
    "status" "EntityStatus" NOT NULL DEFAULT 'draft',
    "canonState" "CanonState" NOT NULL DEFAULT 'canonical',
    "metadata" JSONB,
    "factionKind" TEXT,
    "emblemAssetId" UUID,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "Faction_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LoreEntry" (
    "id" UUID NOT NULL,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "summary" TEXT,
    "content" JSONB,
    "status" "EntityStatus" NOT NULL DEFAULT 'draft',
    "canonState" "CanonState" NOT NULL DEFAULT 'canonical',
    "metadata" JSONB,
    "entryKind" TEXT,
    "topic" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "LoreEntry_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RuleSystem" (
    "id" UUID NOT NULL,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "summary" TEXT,
    "content" JSONB,
    "status" "EntityStatus" NOT NULL DEFAULT 'draft',
    "canonState" "CanonState" NOT NULL DEFAULT 'canonical',
    "metadata" JSONB,
    "systemKind" TEXT,
    "versionLabel" TEXT,
    "appliesTo" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "RuleSystem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Asset" (
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "summary" TEXT,
    "content" JSONB,
    "status" "EntityStatus" NOT NULL DEFAULT 'draft',
    "canonState" "CanonState" NOT NULL DEFAULT 'canonical',
    "metadata" JSONB,
    "assetKind" "AssetKind" NOT NULL DEFAULT 'other',
    "storageKey" TEXT NOT NULL,
    "fileName" TEXT NOT NULL,
    "mimeType" TEXT NOT NULL,
    "byteSize" BIGINT,
    "checksum" TEXT,
    "altText" TEXT,
    "sourceUri" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "Asset_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Tag" (
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "summary" TEXT,
    "content" JSONB,
    "status" "EntityStatus" NOT NULL DEFAULT 'draft',
    "canonState" "CanonState" NOT NULL DEFAULT 'canonical',
    "metadata" JSONB,
    "color" TEXT,
    "namespace" TEXT NOT NULL DEFAULT 'world',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "Tag_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Map" (
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "summary" TEXT,
    "content" JSONB,
    "status" "EntityStatus" NOT NULL DEFAULT 'draft',
    "canonState" "CanonState" NOT NULL DEFAULT 'canonical',
    "metadata" JSONB,
    "mapKind" TEXT,
    "defaultLayerKey" TEXT NOT NULL DEFAULT 'base',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "Map_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MapRegion" (
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "summary" TEXT,
    "content" JSONB,
    "status" "EntityStatus" NOT NULL DEFAULT 'draft',
    "canonState" "CanonState" NOT NULL DEFAULT 'canonical',
    "metadata" JSONB,
    "mapId" UUID NOT NULL,
    "placeId" UUID,
    "layerKey" TEXT NOT NULL DEFAULT 'base',
    "geometryType" "MapGeometryType" NOT NULL,
    "geometry" JSONB NOT NULL,
    "labelPoint" JSONB,
    "displayOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "MapRegion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CharacterRelation" (
    "id" UUID NOT NULL,
    "fromCharacterId" UUID NOT NULL,
    "toCharacterId" UUID NOT NULL,
    "relationType" TEXT NOT NULL,
    "status" "EntityStatus" NOT NULL DEFAULT 'draft',
    "canonState" "CanonState" NOT NULL DEFAULT 'canonical',
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "CharacterRelation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EntityLink" (
    "id" UUID NOT NULL,
    "fromEntityType" TEXT NOT NULL,
    "fromEntityId" UUID NOT NULL,
    "toEntityType" TEXT NOT NULL,
    "toEntityId" UUID NOT NULL,
    "relationType" TEXT NOT NULL,
    "isBidirectional" BOOLEAN NOT NULL DEFAULT false,
    "status" "EntityStatus" NOT NULL DEFAULT 'draft',
    "canonState" "CanonState" NOT NULL DEFAULT 'canonical',
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "EntityLink_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EventParticipant" (
    "id" UUID NOT NULL,
    "eventId" UUID NOT NULL,
    "participantType" TEXT NOT NULL,
    "participantId" UUID NOT NULL,
    "participantRole" TEXT NOT NULL,
    "sequence" INTEGER,
    "note" TEXT,
    "status" "EntityStatus" NOT NULL DEFAULT 'draft',
    "canonState" "CanonState" NOT NULL DEFAULT 'canonical',
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "EventParticipant_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StoryEntity" (
    "id" UUID NOT NULL,
    "storyId" UUID NOT NULL,
    "entityType" TEXT NOT NULL,
    "entityId" UUID NOT NULL,
    "entityRole" TEXT NOT NULL,
    "sequence" INTEGER,
    "note" TEXT,
    "status" "EntityStatus" NOT NULL DEFAULT 'draft',
    "canonState" "CanonState" NOT NULL DEFAULT 'canonical',
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "StoryEntity_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PlaceConnection" (
    "id" UUID NOT NULL,
    "fromPlaceId" UUID NOT NULL,
    "toPlaceId" UUID NOT NULL,
    "connectionType" TEXT NOT NULL,
    "isBidirectional" BOOLEAN NOT NULL DEFAULT true,
    "distanceKm" DOUBLE PRECISION,
    "travelTimeText" TEXT,
    "status" "EntityStatus" NOT NULL DEFAULT 'draft',
    "canonState" "CanonState" NOT NULL DEFAULT 'canonical',
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "PlaceConnection_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EntityTag" (
    "id" UUID NOT NULL,
    "entityType" TEXT NOT NULL,
    "entityId" UUID NOT NULL,
    "tagId" UUID NOT NULL,
    "context" TEXT,
    "status" "EntityStatus" NOT NULL DEFAULT 'draft',
    "canonState" "CanonState" NOT NULL DEFAULT 'canonical',
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "EntityTag_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AssetLink" (
    "id" UUID NOT NULL,
    "assetId" UUID NOT NULL,
    "entityType" TEXT NOT NULL,
    "entityId" UUID NOT NULL,
    "usageType" TEXT NOT NULL,
    "status" "EntityStatus" NOT NULL DEFAULT 'draft',
    "canonState" "CanonState" NOT NULL DEFAULT 'canonical',
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "AssetLink_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MapRegionLink" (
    "id" UUID NOT NULL,
    "regionId" UUID NOT NULL,
    "entityType" TEXT NOT NULL,
    "entityId" UUID NOT NULL,
    "linkType" TEXT NOT NULL,
    "isPrimary" BOOLEAN NOT NULL DEFAULT false,
    "status" "EntityStatus" NOT NULL DEFAULT 'draft',
    "canonState" "CanonState" NOT NULL DEFAULT 'canonical',
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "MapRegionLink_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Character_slug_key" ON "Character"("slug");

-- CreateIndex
CREATE INDEX "Character_slug_idx" ON "Character"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "Place_slug_key" ON "Place"("slug");

-- CreateIndex
CREATE INDEX "Place_slug_idx" ON "Place"("slug");

-- CreateIndex
CREATE INDEX "Place_placeScale_idx" ON "Place"("placeScale");

-- CreateIndex
CREATE INDEX "Place_parentPlaceId_idx" ON "Place"("parentPlaceId");

-- CreateIndex
CREATE UNIQUE INDEX "Story_slug_key" ON "Story"("slug");

-- CreateIndex
CREATE INDEX "Story_slug_idx" ON "Story"("slug");

-- CreateIndex
CREATE INDEX "Story_primaryPlaceId_idx" ON "Story"("primaryPlaceId");

-- CreateIndex
CREATE UNIQUE INDEX "Event_slug_key" ON "Event"("slug");

-- CreateIndex
CREATE INDEX "Event_slug_idx" ON "Event"("slug");

-- CreateIndex
CREATE INDEX "Event_storyId_idx" ON "Event"("storyId");

-- CreateIndex
CREATE INDEX "Event_placeId_idx" ON "Event"("placeId");

-- CreateIndex
CREATE UNIQUE INDEX "Faction_slug_key" ON "Faction"("slug");

-- CreateIndex
CREATE INDEX "Faction_slug_idx" ON "Faction"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "LoreEntry_slug_key" ON "LoreEntry"("slug");

-- CreateIndex
CREATE INDEX "LoreEntry_slug_idx" ON "LoreEntry"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "RuleSystem_slug_key" ON "RuleSystem"("slug");

-- CreateIndex
CREATE INDEX "RuleSystem_slug_idx" ON "RuleSystem"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "Asset_slug_key" ON "Asset"("slug");

-- CreateIndex
CREATE INDEX "Asset_slug_idx" ON "Asset"("slug");

-- CreateIndex
CREATE INDEX "Asset_storageKey_idx" ON "Asset"("storageKey");

-- CreateIndex
CREATE UNIQUE INDEX "Tag_slug_key" ON "Tag"("slug");

-- CreateIndex
CREATE INDEX "Tag_slug_idx" ON "Tag"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "Map_slug_key" ON "Map"("slug");

-- CreateIndex
CREATE INDEX "Map_slug_idx" ON "Map"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "MapRegion_slug_key" ON "MapRegion"("slug");

-- CreateIndex
CREATE INDEX "MapRegion_slug_idx" ON "MapRegion"("slug");

-- CreateIndex
CREATE INDEX "MapRegion_mapId_idx" ON "MapRegion"("mapId");

-- CreateIndex
CREATE INDEX "MapRegion_placeId_idx" ON "MapRegion"("placeId");

-- CreateIndex
CREATE INDEX "MapRegion_mapId_layerKey_idx" ON "MapRegion"("mapId", "layerKey");

-- CreateIndex
CREATE INDEX "CharacterRelation_fromCharacterId_idx" ON "CharacterRelation"("fromCharacterId");

-- CreateIndex
CREATE INDEX "CharacterRelation_toCharacterId_idx" ON "CharacterRelation"("toCharacterId");

-- CreateIndex
CREATE INDEX "CharacterRelation_relationType_idx" ON "CharacterRelation"("relationType");

-- CreateIndex
CREATE INDEX "EntityLink_fromEntityType_fromEntityId_idx" ON "EntityLink"("fromEntityType", "fromEntityId");

-- CreateIndex
CREATE INDEX "EntityLink_toEntityType_toEntityId_idx" ON "EntityLink"("toEntityType", "toEntityId");

-- CreateIndex
CREATE INDEX "EntityLink_relationType_idx" ON "EntityLink"("relationType");

-- CreateIndex
CREATE INDEX "EventParticipant_eventId_idx" ON "EventParticipant"("eventId");

-- CreateIndex
CREATE INDEX "EventParticipant_participantType_participantId_idx" ON "EventParticipant"("participantType", "participantId");

-- CreateIndex
CREATE INDEX "EventParticipant_participantRole_idx" ON "EventParticipant"("participantRole");

-- CreateIndex
CREATE INDEX "StoryEntity_storyId_idx" ON "StoryEntity"("storyId");

-- CreateIndex
CREATE INDEX "StoryEntity_entityType_entityId_idx" ON "StoryEntity"("entityType", "entityId");

-- CreateIndex
CREATE INDEX "StoryEntity_entityRole_idx" ON "StoryEntity"("entityRole");

-- CreateIndex
CREATE INDEX "PlaceConnection_fromPlaceId_idx" ON "PlaceConnection"("fromPlaceId");

-- CreateIndex
CREATE INDEX "PlaceConnection_toPlaceId_idx" ON "PlaceConnection"("toPlaceId");

-- CreateIndex
CREATE INDEX "PlaceConnection_connectionType_idx" ON "PlaceConnection"("connectionType");

-- CreateIndex
CREATE INDEX "EntityTag_entityType_entityId_idx" ON "EntityTag"("entityType", "entityId");

-- CreateIndex
CREATE INDEX "EntityTag_tagId_idx" ON "EntityTag"("tagId");

-- CreateIndex
CREATE INDEX "AssetLink_assetId_idx" ON "AssetLink"("assetId");

-- CreateIndex
CREATE INDEX "AssetLink_entityType_entityId_idx" ON "AssetLink"("entityType", "entityId");

-- CreateIndex
CREATE INDEX "AssetLink_usageType_idx" ON "AssetLink"("usageType");

-- CreateIndex
CREATE INDEX "MapRegionLink_regionId_idx" ON "MapRegionLink"("regionId");

-- CreateIndex
CREATE INDEX "MapRegionLink_entityType_entityId_idx" ON "MapRegionLink"("entityType", "entityId");

-- CreateIndex
CREATE INDEX "MapRegionLink_linkType_idx" ON "MapRegionLink"("linkType");

-- AddForeignKey
ALTER TABLE "Place" ADD CONSTRAINT "Place_parentPlaceId_fkey" FOREIGN KEY ("parentPlaceId") REFERENCES "Place"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Story" ADD CONSTRAINT "Story_primaryPlaceId_fkey" FOREIGN KEY ("primaryPlaceId") REFERENCES "Place"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Event" ADD CONSTRAINT "Event_storyId_fkey" FOREIGN KEY ("storyId") REFERENCES "Story"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Event" ADD CONSTRAINT "Event_placeId_fkey" FOREIGN KEY ("placeId") REFERENCES "Place"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MapRegion" ADD CONSTRAINT "MapRegion_mapId_fkey" FOREIGN KEY ("mapId") REFERENCES "Map"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MapRegion" ADD CONSTRAINT "MapRegion_placeId_fkey" FOREIGN KEY ("placeId") REFERENCES "Place"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CharacterRelation" ADD CONSTRAINT "CharacterRelation_fromCharacterId_fkey" FOREIGN KEY ("fromCharacterId") REFERENCES "Character"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CharacterRelation" ADD CONSTRAINT "CharacterRelation_toCharacterId_fkey" FOREIGN KEY ("toCharacterId") REFERENCES "Character"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EventParticipant" ADD CONSTRAINT "EventParticipant_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StoryEntity" ADD CONSTRAINT "StoryEntity_storyId_fkey" FOREIGN KEY ("storyId") REFERENCES "Story"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PlaceConnection" ADD CONSTRAINT "PlaceConnection_fromPlaceId_fkey" FOREIGN KEY ("fromPlaceId") REFERENCES "Place"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PlaceConnection" ADD CONSTRAINT "PlaceConnection_toPlaceId_fkey" FOREIGN KEY ("toPlaceId") REFERENCES "Place"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EntityTag" ADD CONSTRAINT "EntityTag_tagId_fkey" FOREIGN KEY ("tagId") REFERENCES "Tag"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AssetLink" ADD CONSTRAINT "AssetLink_assetId_fkey" FOREIGN KEY ("assetId") REFERENCES "Asset"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MapRegionLink" ADD CONSTRAINT "MapRegionLink_regionId_fkey" FOREIGN KEY ("regionId") REFERENCES "MapRegion"("id") ON DELETE CASCADE ON UPDATE CASCADE;

