import { PageContainer } from '@/components/ui/page-container';
import { SectionHeader } from '@/components/ui/section-header';
import { getUiText } from '@/lib/i18n/ui';

const ui = getUiText();

export default function LoreEntriesLoading() {
  return (
    <PageContainer>
      <SectionHeader title={ui.loreEntries.title} description={ui.loreEntries.loadingDescription} />
      <div className="panel detail-panel">
        <p className="muted">{ui.common.loadingData}</p>
      </div>
    </PageContainer>
  );
}
