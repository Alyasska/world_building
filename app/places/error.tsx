"use client";

import Link from 'next/link';
import { PageContainer } from '@/components/ui/page-container';
import { SectionHeader } from '@/components/ui/section-header';

type PlacesErrorProps = {
  error: Error;
  reset: () => void;
};

export default function PlacesError({ error, reset }: PlacesErrorProps) {
  return (
    <PageContainer narrow>
      <SectionHeader title="Places" description="Something went wrong while loading this section." />
      <div className="empty-state">
        <h2 className="empty-state__title">Unable to load places</h2>
        <p className="empty-state__description">{error.message || 'Unknown error'}</p>
        <div className="actions-row">
          <button type="button" className="button" onClick={reset}>
            Retry
          </button>
          <Link href="/" className="button-link">
            Back to dashboard
          </Link>
        </div>
      </div>
    </PageContainer>
  );
}