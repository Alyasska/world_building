"use client";

import Link from 'next/link';
import { PageContainer } from '@/components/ui/page-container';
import { SectionHeader } from '@/components/ui/section-header';
import { getUiText } from '@/lib/i18n/ui';

const ui = getUiText();

type Props = { error: Error; reset: () => void };

export default function RuleSystemsError({ error, reset }: Props) {
  return (
    <PageContainer narrow>
      <SectionHeader title={ui.ruleSystems.title} description={ui.ruleSystems.errorSectionDescription} />
      <div className="empty-state">
        <h2 className="empty-state__title">{ui.ruleSystems.loadFailed}</h2>
        <p className="empty-state__description">{error.message || ui.common.unknownError}</p>
        <div className="actions-row">
          <button type="button" className="button" onClick={reset}>{ui.common.retry}</button>
          <Link href="/" className="button-link">{ui.common.backToDashboard}</Link>
        </div>
      </div>
    </PageContainer>
  );
}
