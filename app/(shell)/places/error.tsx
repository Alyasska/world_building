"use client";

import Link from 'next/link';
import { PageContainer } from '@/components/ui/page-container';
import { SectionHeader } from '@/components/ui/section-header';
import { getUiText } from '@/lib/i18n/ui';

const ui = getUiText();

type PlacesErrorProps = {
  error: Error;
  reset: () => void;
};

export default function PlacesError({ error, reset }: PlacesErrorProps) {
  return (
    <PageContainer narrow>
      <SectionHeader title={ui.places.title} description={ui.places.errorSectionDescription} />
      <div className="empty-state">
        <h2 className="empty-state__title">{ui.places.loadFailed}</h2>
        <p className="empty-state__description">{error.message || ui.common.unknownError}</p>
        <div className="actions-row">
          <button type="button" className="button" onClick={reset}>
            {ui.common.retry}
          </button>
          <Link href="/" className="button-link">
            {ui.common.backToDashboard}
          </Link>
        </div>
      </div>
    </PageContainer>
  );
}