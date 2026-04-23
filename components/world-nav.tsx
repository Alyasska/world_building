'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useUiText } from '@/lib/i18n/use-ui-text';

export function WorldNav() {
  const ui = useUiText();
  const pathname = usePathname();

  const links = [
    { href: '/maps', label: ui.nav.maps },
    { href: '/places', label: ui.nav.places },
    { href: '/characters', label: ui.nav.characters },
    { href: '/stories', label: ui.nav.stories },
    { href: '/events', label: ui.nav.events },
    { href: '/factions', label: ui.nav.factions },
  ];

  return (
    <header className="world-nav">
      <Link href="/world" className="world-nav__brand">
        {ui.shell.brandTitle}
      </Link>
      <nav className="world-nav__links" aria-label={ui.nav.ariaLabel}>
        {links.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className={`world-nav__link${pathname.startsWith(link.href) ? ' world-nav__link--active' : ''}`}
          >
            {link.label}
          </Link>
        ))}
      </nav>
      <Link href="/search" className="world-nav__search">
        {ui.search.label}
      </Link>
    </header>
  );
}
