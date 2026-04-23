import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getFaction } from '@/server/faction-service';
import { PageContainer } from '@/components/ui/page-container';
import { SectionHeader } from '@/components/ui/section-header';
import { FactionForm } from '@/features/factions/faction-form';
import { toTextareaValue } from '@/lib/form';
import { getUiText } from '@/lib/i18n/ui';

const ui = getUiText();

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function EditFactionPage({ params }: PageProps) {
  const { id } = await params;
  const faction = await getFaction(id);

  if (!faction) {
    notFound();
  }

  return (
    <PageContainer narrow>
      <SectionHeader
        title={`${ui.factions.editTitlePrefix} ${faction.name}`}
        description={ui.factions.editDescription}
        actions={<Link href={`/factions/${faction.id}`} className="button-link">{ui.common.backToDetail}</Link>}
      />
      <FactionForm
        mode="edit"
        endpoint={`/api/factions/${faction.id}`}
        redirectTo="/factions"
        initialValues={{
          name: faction.name,
          slug: faction.slug,
          summary: faction.summary ?? '',
          factionKind: faction.factionKind ?? '',
          content: toTextareaValue(faction.content),
          status: faction.status,
          canonState: faction.canonState,
        }}
      />
    </PageContainer>
  );
}
