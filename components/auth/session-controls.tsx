"use client";

import Link from 'next/link';
import { signOut } from 'next-auth/react';
import { usePathname } from 'next/navigation';
import { useUiText } from '@/lib/i18n/use-ui-text';

type SessionControlsProps = {
  isAuthenticated: boolean;
};

export function SessionControls({ isAuthenticated }: SessionControlsProps) {
  const ui = useUiText();
  const pathname = usePathname();

  if (!isAuthenticated) {
    return (
      <Link href={`/login?next=${encodeURIComponent(pathname || '/')}`} className="button-link">
        {ui.auth.signIn}
      </Link>
    );
  }

  return (
    <button type="button" className="button" onClick={() => signOut({ callbackUrl: '/' })}>
      {ui.auth.signOut}
    </button>
  );
}
