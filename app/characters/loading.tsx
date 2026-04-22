import { PageContainer } from '@/components/ui/page-container';
import { SectionHeader } from '@/components/ui/section-header';

export default function CharactersLoading() {
  return (
    <PageContainer>
      <SectionHeader title="Characters" description="Loading characters..." />
      <div className="panel detail-panel">
        <p className="muted">Loading data...</p>
      </div>
    </PageContainer>
  );
}
