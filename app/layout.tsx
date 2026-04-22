import type { Metadata, Viewport } from 'next';
import type { ReactNode } from 'react';
import { SiteNav } from '@/components/site-nav';
import { GlobalSearchForm } from '@/components/ui/global-search-form';
import { defaultUiLocale, getUiText } from '@/lib/i18n/ui';
import './globals.css';

const ui = getUiText();

export const metadata: Metadata = {
  title: ui.meta.appTitle,
  description: ui.meta.appDescription,
};

export const viewport: Viewport = {
  themeColor: '#0f1115',
};

type RootLayoutProps = {
  children: ReactNode;
};

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang={defaultUiLocale}>
      <body>
        <div className="app-shell">
          <aside className="app-shell__sidebar">
            <div className="app-shell__brand">
              <h1 className="app-shell__brand-title">{ui.shell.brandTitle}</h1>
              <p className="app-shell__brand-note">{ui.shell.brandNote}</p>
            </div>
            <GlobalSearchForm />
            <SiteNav />
          </aside>
          <main className="app-shell__main">{children}</main>
        </div>
      </body>
    </html>
  );
}
