'use client';

import { usePathname } from 'next/navigation';
import Header from './Header';
import BottomNav from './BottomNav';

/**
 * Renders the customer-facing chrome (search header + bottom nav) everywhere
 * EXCEPT under /admin, which has its own layout (see src/app/admin/layout.tsx).
 */
export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAdmin = pathname?.startsWith('/admin');

  if (isAdmin) {
    return <>{children}</>;
  }

  return (
    <>
      <Header />
      <main className="max-w-4xl mx-auto pb-24 min-h-[70vh]">{children}</main>
      <BottomNav />
    </>
  );
}
