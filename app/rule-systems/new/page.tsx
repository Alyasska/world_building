import Link from 'next/link';
import { PageContainer } from '@/components/ui/page-container';
import { SectionHeader } from '@/components/ui/section-header';
import { RuleSystemForm } from '@/features/rule-systems/rule-system-form';
import { getUiText } from '@/lib/i18n/ui';

const ui = getUiText();

export default function NewRuleSystemPage() {
  return (
    <PageContainer narrow>
      <SectionHeader title={ui.ruleSystems.newTitle} description={ui.ruleSystems.newDescription} actions={<Link href="/rule-systems" className="button-link">{ui.common.backToList}</Link>} />
      <RuleSystemForm mode="create" endpoint="/api/rule-systems" redirectTo="/rule-systems" />
    </PageContainer>
  );
}
