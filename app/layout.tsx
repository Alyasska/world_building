import type { Metadata, Viewport } from 'next';
import type { ReactNode } from 'react';
import { PT_Serif } from 'next/font/google';
import { NextIntlClientProvider } from 'next-intl';
import { getLocale, getMessages } from 'next-intl/server';
import { getRequestUiLocale } from '@/lib/i18n/request';
import './globals.css';

const ptSerif = PT_Serif({
  weight: ['400', '700'],
  style: ['normal', 'italic'],
  subsets: ['latin', 'cyrillic'],
  variable: '--font-serif',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'World Engine',
  description: 'Private worldbuilding workspace',
};

export const viewport: Viewport = {
  themeColor: '#0f1115',
};

export default async function RootLayout({ children }: { children: ReactNode }) {
  const locale = await getRequestUiLocale();
  const [messages, intlLocale] = await Promise.all([getMessages(), getLocale()]);

  return (
    <html lang={locale} className={ptSerif.variable}>
      <body>
        <NextIntlClientProvider locale={intlLocale} messages={messages}>
          {children}
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
