import { prisma } from '@/lib/prisma';
import { WorldHome } from '@/components/world-home';
import { listMaps } from '@/server/map-service';
import { listRootPlaces } from '@/server/place-service';

async function getWorldStats() {
  const [places, characters] = await Promise.allSettled([
    prisma.place.count({ where: { deletedAt: null } }),
    prisma.character.count({ where: { deletedAt: null } }),
  ]);

  return {
    places: places.status === 'fulfilled' ? places.value : null,
    characters: characters.status === 'fulfilled' ? characters.value : null,
  };
}

export default async function WorldPage() {
  const [maps, rootPlaces, stats] = await Promise.all([
    listMaps(),
    listRootPlaces(),
    getWorldStats(),
  ]);

  return <WorldHome maps={maps} rootPlaces={rootPlaces} stats={stats} />;
}
