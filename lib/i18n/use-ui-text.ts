"use client";

import { useLocale } from 'next-intl';
import { getUiText, type UiLocale } from '@/lib/i18n/ui';

export function useUiText() {
  const locale = useLocale() as UiLocale;
  return getUiText(locale);
}
