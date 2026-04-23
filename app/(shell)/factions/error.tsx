"use client";

import Link from 'next/link';
import { PageContainer } from '@/components/ui/page-container';
import { SectionHeader } from '@/components/ui/section-header';
import { getUiText } from '@/lib/i18n/ui';

const ui = getUiText();

type FactionsErrorProps = {
  error: Error;
  reset: () => void;
};

export default function FactionsError({ error, reset }: FactionsErrorProps) {
  return (
    <PageContainer narrow>
      <SectionHeader title={ui.factions.title} description={ui.factions.errorSectionDescription} />
      <div className="empty-state">
        <h2 className="empty-state__title">{ui.factions.loadFailed}</h2>
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
