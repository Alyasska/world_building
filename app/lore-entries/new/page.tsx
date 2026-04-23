import Link from 'next/link';
import { PageContainer } from '@/components/ui/page-container';
import { SectionHeader } from '@/components/ui/section-header';
import { LoreEntryForm } from '@/features/lore-entries/lore-entry-form';
import { getUiText } from '@/lib/i18n/ui';

const ui = getUiText();

export default function NewLoreEntryPage() {
  return (
    <PageContainer narrow>
      <SectionHeader
        title={ui.loreEntries.newTitle}
        description={ui.loreEntries.newDescription}
        actions={<Link href="/lore-entries" className="button-link">{ui.common.backToList}</Link>}
      />
      <LoreEntryForm mode="create" endpoint="/api/lore-entries" redirectTo="/lore-entries" />
    </PageContainer>
  );
}
