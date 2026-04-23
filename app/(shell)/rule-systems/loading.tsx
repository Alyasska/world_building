import { PageContainer } from '@/components/ui/page-container';
import { SectionHeader } from '@/components/ui/section-header';
import { getUiText } from '@/lib/i18n/ui';

const ui = getUiText();

export default function RuleSystemsLoading() {
  return (
    <PageContainer>
      <SectionHeader title={ui.ruleSystems.title} description={ui.ruleSystems.loadingDescription} />
      <div className="panel detail-panel"><p className="muted">{ui.common.loadingData}</p></div>
    </PageContainer>
  );
}
