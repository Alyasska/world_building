import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getLoreEntry } from '@/server/lore-entry-service';
import { PageContainer } from '@/components/ui/page-container';
import { SectionHeader } from '@/components/ui/section-header';
import { LoreEntryForm } from '@/features/lore-entries/lore-entry-form';
import { toTextareaValue } from '@/lib/form';
import { getUiText } from '@/lib/i18n/ui';

const ui = getUiText();

type PageProps = { params: Promise<{ id: string }> };

export default async function EditLoreEntryPage({ params }: PageProps) {
  const { id } = await params;
  const entry = await getLoreEntry(id);

  if (!entry) notFound();

  return (
    <PageContainer narrow>
      <SectionHeader
        title={`${ui.loreEntries.editTitlePrefix} ${entry.title}`}
        description={ui.loreEntries.editDescription}
        actions={<Link href={`/lore-entries/${entry.id}`} className="button-link">{ui.common.backToDetail}</Link>}
      />
      <LoreEntryForm
        mode="edit"
        endpoint={`/api/lore-entries/${entry.id}`}
        redirectTo="/lore-entries"
        initialValues={{
          title: entry.title,
          slug: entry.slug,
          summary: entry.summary ?? '',
          entryKind: entry.entryKind ?? '',
          topic: entry.topic ?? '',
          content: toTextareaValue(entry.content),
          status: entry.status,
          canonState: entry.canonState,
        }}
      />
    </PageContainer>
  );
}
