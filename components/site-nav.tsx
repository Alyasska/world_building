"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const links = [
  { href: '/', label: 'Dashboard' },
  { href: '/characters', label: 'Characters' },
  { href: '/places', label: 'Places' },
];

export function SiteNav() {
  const pathname = usePathname();

  return (
    <nav className="site-nav" aria-label="Primary">
      {links.map((link) => {
        const isActive = pathname === link.href || (link.href !== '/' && pathname.startsWith(link.href));

        return (
          <Link key={link.href} href={link.href} className={`site-nav__link${isActive ? ' site-nav__link--active' : ''}`}>
            {link.label}
          </Link>
        );
      })}
    </nav>
  );
}
