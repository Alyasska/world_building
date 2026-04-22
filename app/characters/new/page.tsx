import Link from 'next/link';
import { PageContainer } from '@/components/ui/page-container';
import { SectionHeader } from '@/components/ui/section-header';
import { CharacterForm } from '@/features/characters/character-form';

export default function NewCharacterPage() {
  return (
    <PageContainer narrow>
      <SectionHeader
        title="New Character"
        description="Create a minimal character record. Slug is optional and can be generated from the name."
        actions={<Link href="/characters" className="button-link">Back to list</Link>}
      />
      <CharacterForm mode="create" endpoint="/api/characters" redirectTo={(id) => `/characters/${id}`} />
    </PageContainer>
  );
}
