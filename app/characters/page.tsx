import Link from 'next/link';
import { listCharacters } from '@/server/character-service';
import { EmptyState } from '@/components/ui/empty-state';
import { PageContainer } from '@/components/ui/page-container';
import { SectionHeader } from '@/components/ui/section-header';
import { StatusBadge } from '@/components/ui/status-badge';

export default async function CharactersPage() {
  const characters = await listCharacters();

  return (
    <PageContainer>
      <SectionHeader
        title="Characters"
        description="Core people and actors in the world. Create, inspect, and keep the record simple for now."
        actions={
          <Link href="/characters/new" className="button">
            New Character
          </Link>
        }
      />

      {characters.length === 0 ? (
        <EmptyState
          title="No characters yet"
          description="Start by creating the first person or actor in the world."
          action={
            <Link href="/characters/new" className="button">
              Create Character
            </Link>
          }
        />
      ) : (
        <div className="list-stack">
          {characters.map((character) => (
            <article key={character.id} className="list-item">
              <div className="list-item__topline">
                <div>
                  <h2 className="list-item__title">
                    <Link href={`/characters/${character.id}`}>{character.name}</Link>
                  </h2>
                  <p className="muted">{character.slug}</p>
                </div>
                <div className="meta-row">
                  <StatusBadge value={character.status} />
                  <StatusBadge value={character.canonState} label={character.canonState} />
                </div>
              </div>
              {character.summary ? <p className="list-item__summary">{character.summary}</p> : null}
            </article>
          ))}
        </div>
      )}
    </PageContainer>
  );
}
