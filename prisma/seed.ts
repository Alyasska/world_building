import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Places
  const world = await prisma.place.upsert({
    where: { slug: 'aethoria' },
    update: {},
    create: {
      name: 'Aethoria',
      slug: 'aethoria',
      summary: 'The known world — a continent of ancient empires, wild frontiers, and forgotten gods.',
      status: 'active',
      canonState: 'canonical',
      placeScale: 'world',
      placeKind: 'continent',
    },
  });

  const empire = await prisma.place.upsert({
    where: { slug: 'valdris-empire' },
    update: {},
    create: {
      name: 'Valdris Empire',
      slug: 'valdris-empire',
      summary: 'A vast empire spanning the central plains, ruled by the iron-fisted Valdris dynasty for three centuries.',
      status: 'active',
      canonState: 'canonical',
      placeScale: 'country',
      placeKind: 'empire',
      parentPlaceId: world.id,
    },
  });

  const capital = await prisma.place.upsert({
    where: { slug: 'solmere' },
    update: {},
    create: {
      name: 'Solmere',
      slug: 'solmere',
      summary: 'The imperial capital, a city of marble towers and labyrinthine canals built on a ancient dragon graveyard.',
      status: 'active',
      canonState: 'canonical',
      placeScale: 'city',
      placeKind: 'capital',
      parentPlaceId: empire.id,
      locationText: 'Heart of the Valdris Empire, on the banks of the Solm River',
    },
  });

  const ruins = await prisma.place.upsert({
    where: { slug: 'ashenveil-ruins' },
    update: {},
    create: {
      name: 'Ashenveil Ruins',
      slug: 'ashenveil-ruins',
      summary: 'Once the spiritual center of the Elhari people. Now a haunted wasteland after the Burning Accord.',
      status: 'active',
      canonState: 'canonical',
      placeScale: 'landmark',
      placeKind: 'ruins',
      parentPlaceId: world.id,
      locationText: 'Eastern borderlands, three days east of Solmere',
    },
  });

  // Characters
  const kira = await prisma.character.upsert({
    where: { slug: 'kira-voss' },
    update: {},
    create: {
      name: 'Kira Voss',
      slug: 'kira-voss',
      summary: 'A disgraced imperial archivist who knows the empire\'s darkest secret — its founding was built on a lie.',
      status: 'active',
      canonState: 'canonical',
      pronouns: 'she/her',
      epithet: 'The Keeper of Ashes',
    },
  });

  const emperor = await prisma.character.upsert({
    where: { slug: 'aldric-valdris-iii' },
    update: {},
    create: {
      name: 'Aldric Valdris III',
      slug: 'aldric-valdris-iii',
      summary: 'The current emperor. Paranoid, brilliant, and desperate to maintain a dynasty built on forgeries.',
      status: 'active',
      canonState: 'canonical',
      pronouns: 'he/him',
      epithet: 'The Unbroken',
    },
  });

  const maren = await prisma.character.upsert({
    where: { slug: 'maren-sol' },
    update: {},
    create: {
      name: 'Maren Sol',
      slug: 'maren-sol',
      summary: 'Last heir of the Elhari people. Raised in exile, hunting the truth about the Burning Accord.',
      status: 'active',
      canonState: 'canonical',
      pronouns: 'they/them',
      epithet: 'Child of Ash',
    },
  });

  // Tags
  const tagConflict = await prisma.tag.upsert({
    where: { slug: 'political-conflict' },
    update: {},
    create: { name: 'Political Conflict', slug: 'political-conflict', color: '#c0392b', namespace: 'theme' },
  });

  const tagMystery = await prisma.tag.upsert({
    where: { slug: 'mystery' },
    update: {},
    create: { name: 'Mystery', slug: 'mystery', color: '#8e44ad', namespace: 'theme' },
  });

  const tagTrauma = await prisma.tag.upsert({
    where: { slug: 'historical-trauma' },
    update: {},
    create: { name: 'Historical Trauma', slug: 'historical-trauma', color: '#e67e22', namespace: 'theme' },
  });

  // Stories
  const mainStory = await prisma.story.upsert({
    where: { slug: 'the-ashes-beneath' },
    update: {},
    create: {
      title: 'The Ashes Beneath',
      slug: 'the-ashes-beneath',
      summary: 'When imperial archivist Kira Voss discovers the empire\'s founding documents are forgeries, she must choose between silence and a truth that could shatter the known world.',
      status: 'active',
      canonState: 'canonical',
      storyKind: 'novel',
      primaryPlaceId: capital.id,
    },
  });

  const prequel = await prisma.story.upsert({
    where: { slug: 'the-burning-accord' },
    update: {},
    create: {
      title: 'The Burning Accord',
      slug: 'the-burning-accord',
      summary: 'Three hundred years before Kira\'s discovery — how the Valdris founders destroyed the Elhari people and rewrote history.',
      status: 'active',
      canonState: 'canonical',
      storyKind: 'novella',
      primaryPlaceId: ruins.id,
    },
  });

  // Events
  const event1 = await prisma.event.upsert({
    where: { slug: 'kira-discovers-the-forgery' },
    update: {},
    create: {
      title: 'Kira Discovers the Forgery',
      slug: 'kira-discovers-the-forgery',
      summary: 'While cataloguing a sealed vault in the Imperial Archive, Kira finds the original founding charter — and it names a different dynasty entirely.',
      status: 'active',
      canonState: 'canonical',
      storyId: mainStory.id,
      placeId: capital.id,
      eventDateText: 'Year 312 of the Valdris Reckoning',
      datePrecision: 'day',
    },
  });

  const event2 = await prisma.event.upsert({
    where: { slug: 'the-imperial-purge-of-ashenveil' },
    update: {},
    create: {
      title: 'The Imperial Purge of Ashenveil',
      slug: 'the-imperial-purge-of-ashenveil',
      summary: 'The Valdris founders order the complete destruction of the Elhari spiritual center and massacre its scholars to erase the historical record.',
      status: 'active',
      canonState: 'canonical',
      storyId: prequel.id,
      placeId: ruins.id,
      eventDateText: 'Year 1 of the Valdris Reckoning',
      datePrecision: 'year',
    },
  });

  // Attach tags
  await prisma.entityTag.createMany({
    skipDuplicates: true,
    data: [
      { entityType: 'story', entityId: mainStory.id, tagId: tagMystery.id },
      { entityType: 'story', entityId: mainStory.id, tagId: tagConflict.id },
      { entityType: 'story', entityId: prequel.id, tagId: tagTrauma.id },
      { entityType: 'story', entityId: prequel.id, tagId: tagConflict.id },
      { entityType: 'event', entityId: event2.id, tagId: tagTrauma.id },
    ],
  });

  // Event participants
  await prisma.eventParticipant.createMany({
    skipDuplicates: true,
    data: [
      { eventId: event1.id, participantType: 'character', participantId: kira.id, participantRole: 'protagonist' },
      { eventId: event2.id, participantType: 'character', participantId: emperor.id, participantRole: 'antagonist' },
      { eventId: event2.id, participantType: 'character', participantId: maren.id, participantRole: 'victim' },
    ],
  });

  // Character relations
  await prisma.characterRelation.createMany({
    skipDuplicates: true,
    data: [
      { fromCharacterId: kira.id, toCharacterId: emperor.id, relationType: 'subject_of', status: 'active', canonState: 'canonical' },
      { fromCharacterId: maren.id, toCharacterId: emperor.id, relationType: 'enemy_of', status: 'active', canonState: 'canonical' },
    ],
  });

  console.log('Seed complete.');
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
