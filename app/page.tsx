import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import { PageContainer } from '@/components/ui/page-container';
import { SectionHeader } from '@/components/ui/section-header';

async function getDashboardCounts() {
  const [characters, places] = await Promise.allSettled([
    prisma.character.count({ where: { deletedAt: null } }),
    prisma.place.count({ where: { deletedAt: null } }),
  ]);

  return {
    characters: characters.status === 'fulfilled' ? characters.value : null,
    places: places.status === 'fulfilled' ? places.value : null,
  };
}

export default async function HomePage() {
  const counts = await getDashboardCounts();

  return (
    <PageContainer>
      <SectionHeader
        title="Dashboard"
        description="A simple, data-driven shell for private worldbuilding work. Use Characters and Places as the first editable sections."
      />

      <section className="dashboard-grid">
        <article className="dashboard-card">
          <div className="dashboard-card__eyebrow">Characters</div>
          <h2>{counts.characters ?? '—'}</h2>
          <p>People, actors, and other central figures.</p>
          <div className="actions-row" style={{ marginTop: '14px' }}>
            <Link href="/characters" className="button-link">
              Open Characters
            </Link>
          </div>
        </article>

        <article className="dashboard-card">
          <div className="dashboard-card__eyebrow">Places</div>
          <h2>{counts.places ?? '—'}</h2>
          <p>Locations, regions, and mapped places.</p>
          <div className="actions-row" style={{ marginTop: '14px' }}>
            <Link href="/places" className="button-link">
              Open Places
            </Link>
          </div>
        </article>

      </section>

      <section style={{ marginTop: '24px' }}>
        <div className="card-grid">
          <Link href="/characters" className="card">
            <div className="card__eyebrow">Primary data</div>
            <h3>Characters</h3>
            <p>Create, read, update, and delete core entity records.</p>
          </Link>

          <Link href="/places" className="card">
            <div className="card__eyebrow">Primary data</div>
            <h3>Places</h3>
            <p>Organize locations that later map and relation layers can reference.</p>
          </Link>
        </div>
      </section>
    </PageContainer>
  );
}
