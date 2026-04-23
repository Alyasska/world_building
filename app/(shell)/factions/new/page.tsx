import Link from 'next/link';
import { PageContainer } from '@/components/ui/page-container';
import { SectionHeader } from '@/components/ui/section-header';
import { FactionForm } from '@/features/factions/faction-form';
import { getUiText } from '@/lib/i18n/ui';

const ui = getUiText();

export default function NewFactionPage() {
  return (
    <PageContainer narrow>
      <SectionHeader
        title={ui.factions.newTitle}
        description={ui.factions.newDescription}
        actions={<Link href="/factions" className="button-link">{ui.common.backToList}</Link>}
      />
      <FactionForm mode="create" endpoint="/api/factions" redirectTo="/factions" />
    </PageContainer>
  );
}
