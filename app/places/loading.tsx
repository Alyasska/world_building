import { PageContainer } from '@/components/ui/page-container';
import { SectionHeader } from '@/components/ui/section-header';

export default function PlacesLoading() {
  return (
    <PageContainer>
      <SectionHeader title="Places" description="Loading places..." />
      <div className="panel detail-panel">
        <p className="muted">Loading data...</p>
      </div>
    </PageContainer>
  );
}
