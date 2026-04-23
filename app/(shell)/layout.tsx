import type { ReactNode } from 'react';
import { auth } from '@/auth';
import { SessionControls } from '@/components/auth/session-controls';
import { SiteNav } from '@/components/site-nav';
import { GlobalSearchForm } from '@/components/ui/global-search-form';
import { getRequestUiLocale } from '@/lib/i18n/request';
import { getUiText } from '@/lib/i18n/ui';

type ShellLayoutProps = { children: ReactNode };

export default async function ShellLayout({ children }: ShellLayoutProps) {
  const locale = await getRequestUiLocale();
  const ui = getUiText(locale);
  const session = await auth();

  return (
    <div className="app-shell">
      <aside className="app-shell__sidebar">
        <div className="app-shell__brand">
          <p className="app-shell__brand-eyebrow">{ui.shell.brandNote}</p>
          <h1 className="app-shell__brand-title">{ui.shell.brandTitle}</h1>
        </div>
        <GlobalSearchForm />
        <SiteNav />
        <SessionControls isAuthenticated={Boolean(session?.user)} />
      </aside>
      <main className="app-shell__main">{children}</main>
    </div>
  );
}
