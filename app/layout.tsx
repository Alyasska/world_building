import type { Metadata, Viewport } from 'next';
import type { ReactNode } from 'react';
import { SiteNav } from '@/components/site-nav';
import './globals.css';

export const metadata: Metadata = {
  title: 'World Building App',
  description: 'Private worldbuilding app shell',
};

export const viewport: Viewport = {
  themeColor: '#0f1115',
};

type RootLayoutProps = {
  children: ReactNode;
};

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="en">
      <body>
        <div className="app-shell">
          <aside className="app-shell__sidebar">
            <div className="app-shell__brand">
              <h1 className="app-shell__brand-title">World Building App</h1>
              <p className="app-shell__brand-note">Private canon workspace</p>
            </div>
            <SiteNav />
          </aside>
          <main className="app-shell__main">{children}</main>
        </div>
      </body>
    </html>
  );
}
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'World Building App',
  description: 'Private worldbuilding foundation',
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
