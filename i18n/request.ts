import { getRequestConfig } from 'next-intl/server';
import { getRequestUiLocale } from '@/lib/i18n/request';
import { getIntlMessages } from '@/lib/i18n/ui';

export default getRequestConfig(async () => {
  const locale = await getRequestUiLocale();

  return {
    locale,
    messages: getIntlMessages(locale),
  };
});
