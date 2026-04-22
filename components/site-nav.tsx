"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { getUiText } from '@/lib/i18n/ui';

const ui = getUiText();

const links = [
  { href: '/world', label: ui.nav.world },
  { href: '/places', label: ui.nav.places },
  { href: '/stories', label: ui.nav.stories },
  { href: '/events', label: ui.nav.events },
  { href: '/characters', label: ui.nav.characters },
];

export function SiteNav() {
  const pathname = usePathname();

  return (
    <nav className="site-nav" aria-label={ui.nav.ariaLabel}>
      {links.map((link) => {
        const isWorldLink = link.href === '/world';
        const isActive =
          pathname === link.href ||
          (link.href !== '/' && pathname.startsWith(link.href)) ||
          (isWorldLink && pathname === '/');

        return (
          <Link key={link.href} href={link.href} className={`site-nav__link${isActive ? ' site-nav__link--active' : ''}`}>
            {link.label}
          </Link>
        );
      })}
    </nav>
  );
}
