import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getCharacter } from '@/server/character-service';
import { PageContainer } from '@/components/ui/page-container';
import { SectionHeader } from '@/components/ui/section-header';
import { CharacterForm } from '@/features/characters/character-form';
import { toTextareaValue } from '@/lib/form';
import { getUiText } from '@/lib/i18n/ui';

const ui = getUiText();

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
        title={`${ui.characters.editTitlePrefix} ${character.name}`}
        description={ui.characters.editDescription}
        actions={<Link href={`/characters/${character.id}`} className="button-link">{ui.common.backToDetail}</Link>}
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
