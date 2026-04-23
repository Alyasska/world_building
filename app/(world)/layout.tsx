import type { ReactNode } from 'react';
import { WorldNav } from '@/components/world-nav';

export default function WorldLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <WorldNav />
      <div className="world-layout-body">{children}</div>
    </>
  );
}
