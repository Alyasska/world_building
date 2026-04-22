import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getCharacter } from '@/server/character-service';
import { DeleteButton } from '@/components/ui/delete-button';
import { PageContainer } from '@/components/ui/page-container';
import { SectionHeader } from '@/components/ui/section-header';
import { StatusBadge } from '@/components/ui/status-badge';

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function CharacterDetailPage({ params }: PageProps) {
  const { id } = await params;
  const character = await getCharacter(id);

  if (!character) {
    notFound();
  }

  return (
    <PageContainer narrow>
      <SectionHeader
        title={character.name}
        description={character.summary ?? 'Character detail record.'}
        actions={
          <>
            <Link href="/characters" className="button-link">
              Back to list
            </Link>
            <Link href={`/characters/${character.id}/edit`} className="button-link">
              Edit
            </Link>
            <DeleteButton endpoint={`/api/characters/${character.id}`} redirectTo="/characters" label="Delete" confirmText="Delete this character?" />
          </>
        }
      />

      <div className="detail-grid">
        <section className="panel detail-panel">
          <dl className="detail-dl">
            <dt>Slug</dt>
            <dd>{character.slug}</dd>
            <dt>Status</dt>
            <dd><StatusBadge value={character.status} /></dd>
            <dt>Canon state</dt>
            <dd><StatusBadge value={character.canonState} label={character.canonState} /></dd>
            <dt>Pronouns</dt>
            <dd>{character.pronouns ?? '—'}</dd>
            <dt>Epithet</dt>
            <dd>{character.epithet ?? '—'}</dd>
          </dl>
        </section>

        <section className="panel detail-panel">
          <h2>Content</h2>
          <div className="prose">{character.content ? JSON.stringify(character.content, null, 2) : 'No content yet.'}</div>
        </section>
      </div>
    </PageContainer>
  );
}
