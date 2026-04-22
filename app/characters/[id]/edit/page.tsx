import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getCharacter } from '@/server/character-service';
import { PageContainer } from '@/components/ui/page-container';
import { SectionHeader } from '@/components/ui/section-header';
import { CharacterForm } from '@/features/characters/character-form';
import { toTextareaValue } from '@/lib/form';

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function EditCharacterPage({ params }: PageProps) {
  const { id } = await params;
  const character = await getCharacter(id);

  if (!character) {
    notFound();
  }

  return (
    <PageContainer narrow>
      <SectionHeader
        title={`Edit ${character.name}`}
        description="Update the record while keeping the structure simple."
        actions={<Link href={`/characters/${character.id}`} className="button-link">Back to detail</Link>}
      />
      <CharacterForm
        mode="edit"
        endpoint={`/api/characters/${character.id}`}
        redirectTo={(entityId) => `/characters/${entityId}`}
        initialValues={{
          name: character.name,
          slug: character.slug,
          summary: character.summary ?? '',
          content: toTextareaValue(character.content),
          status: character.status,
          canonState: character.canonState,
        }}
      />
    </PageContainer>
  );
}
