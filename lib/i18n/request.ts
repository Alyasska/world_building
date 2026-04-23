import { cookies, headers } from 'next/headers';
import { defaultUiLocale, resolveUiLocale, supportedUiLocales, type UiLocale } from '@/lib/i18n/ui';

function pickLocaleFromAcceptLanguage(headerValue: string | null): UiLocale {
  if (!headerValue) {
    return defaultUiLocale;
  }

  const requestedLocales = headerValue
    .split(',')
    .map((part) => part.trim().split(';')[0]?.toLowerCase())
    .filter((value): value is string => Boolean(value));

  for (const locale of requestedLocales) {
    const exactMatch = supportedUiLocales.find((supported) => supported === locale);
    if (exactMatch) {
      return exactMatch;
    }

    const languageMatch = supportedUiLocales.find((supported) => locale.startsWith(`${supported}-`));
    if (languageMatch) {
      return languageMatch;
    }
  }

  return defaultUiLocale;
}

export async function getRequestUiLocale(): Promise<UiLocale> {
  const cookieStore = await cookies();
  const cookieLocale = cookieStore.get('locale')?.value;

  if (cookieLocale) {
    return resolveUiLocale(cookieLocale);
  }

  const headerStore = await headers();
  return pickLocaleFromAcceptLanguage(headerStore.get('accept-language'));
}
