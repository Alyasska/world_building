import Link from 'next/link';
import { PageContainer } from '@/components/ui/page-container';
import { SectionHeader } from '@/components/ui/section-header';
import { CharacterForm } from '@/features/characters/character-form';
import { getUiText } from '@/lib/i18n/ui';

const ui = getUiText();

export default function NewCharacterPage() {
  return (
    <PageContainer narrow>
      <SectionHeader
        title={ui.characters.newTitle}
        description={ui.characters.newDescription}
        actions={<Link href="/characters" className="button-link">{ui.common.backToList}</Link>}
      />
      <CharacterForm mode="create" endpoint="/api/characters" redirectTo={(id) => `/characters/${id}`} />
    </PageContainer>
  );
}
