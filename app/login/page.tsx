import Link from 'next/link';
import { PageContainer } from '@/components/ui/page-container';
import { SectionHeader } from '@/components/ui/section-header';
import { getRequestUiLocale } from '@/lib/i18n/request';
import { getUiText } from '@/lib/i18n/ui';
import { LoginForm } from './login-form';

type LoginPageProps = {
  searchParams: Promise<{ next?: string }>;
};

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const locale = await getRequestUiLocale();
  const ui = getUiText(locale);
  const { next } = await searchParams;
  const nextPath = typeof next === 'string' && next.startsWith('/') ? next : '/';

  return (
    <PageContainer narrow>
      <SectionHeader
        title={ui.auth.title}
        description={ui.auth.description}
        actions={
          <Link href={nextPath} className="button-link">
            {ui.auth.back}
          </Link>
        }
      />
      <LoginForm nextPath={nextPath} />
    </PageContainer>
  );
}
