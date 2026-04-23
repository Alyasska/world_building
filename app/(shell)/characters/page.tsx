import Link from 'next/link';
import { listCharacters } from '@/server/character-service';
import { EmptyState } from '@/components/ui/empty-state';
import { PageContainer } from '@/components/ui/page-container';
import { SectionHeader } from '@/components/ui/section-header';
import { StatusBadge } from '@/components/ui/status-badge';
import { getUiText } from '@/lib/i18n/ui';

const ui = getUiText();

export default async function CharactersPage() {
  const characters = await listCharacters();

  return (
    <PageContainer>
      <SectionHeader
        title={ui.characters.title}
        description={ui.characters.pageDescription}
        actions={
          <Link href="/characters/new" className="button">
            {ui.characters.new}
          </Link>
        }
      />

      {characters.length === 0 ? (
        <EmptyState
          title={ui.characters.emptyTitle}
          description={ui.characters.emptyDescription}
          action={
            <Link href="/characters/new" className="button">
              {ui.characters.create}
            </Link>
          }
        />
      ) : (
        <div className="list-stack">
          {characters.map((character) => (
            <article key={character.id} className="list-item">
              <div className="list-item__topline">
                <div>
                  <p className="list-item__type">{ui.common.entityTypes.character}</p>
                  <h2 className="list-item__title">
                    <Link href={`/characters/${character.id}`}>{character.name}</Link>
                  </h2>
                  {character.epithet ? (
                    <p className="muted">{character.epithet}</p>
                  ) : character.pronouns ? (
                    <p className="muted">{character.pronouns}</p>
                  ) : null}
                </div>
                <div className="meta-row">
                  <StatusBadge value={character.status} label={ui.status[character.status]} />
                  <StatusBadge value={character.canonState} label={ui.status[character.canonState]} />
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
