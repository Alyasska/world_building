import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getRuleSystem } from '@/server/rule-system-service';
import { PageContainer } from '@/components/ui/page-container';
import { SectionHeader } from '@/components/ui/section-header';
import { RuleSystemForm } from '@/features/rule-systems/rule-system-form';
import { toTextareaValue } from '@/lib/form';
import { getUiText } from '@/lib/i18n/ui';

const ui = getUiText();

type PageProps = { params: Promise<{ id: string }> };

export default async function EditRuleSystemPage({ params }: PageProps) {
  const { id } = await params;
  const item = await getRuleSystem(id);
  if (!item) notFound();

  return (
    <PageContainer narrow>
      <SectionHeader title={`${ui.ruleSystems.editTitlePrefix} ${item.title}`} description={ui.ruleSystems.editDescription} actions={<Link href={`/rule-systems/${item.id}`} className="button-link">{ui.common.backToDetail}</Link>} />
      <RuleSystemForm mode="edit" endpoint={`/api/rule-systems/${item.id}`} redirectTo="/rule-systems" initialValues={{ title: item.title, slug: item.slug, summary: item.summary ?? '', systemKind: item.systemKind ?? '', versionLabel: item.versionLabel ?? '', appliesTo: item.appliesTo ?? '', content: toTextareaValue(item.content), status: item.status, canonState: item.canonState }} />
    </PageContainer>
  );
}
