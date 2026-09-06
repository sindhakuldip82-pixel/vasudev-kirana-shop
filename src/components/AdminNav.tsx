'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { LayoutDashboard, Package, FolderTree, ClipboardList, Settings, LogOut, Store } from 'lucide-react';

const ITEMS = [
  { href: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/admin/products', label: 'Products', icon: Package },
  { href: '/admin/categories', label: 'Categories', icon: FolderTree },
  { href: '/admin/orders', label: 'Orders', icon: ClipboardList },
  { href: '/admin/settings', label: 'Settings', icon: Settings },
];

export default function AdminNav() {
  const pathname = usePathname();
  const router = useRouter();

  async function logout() {
    await fetch('/api/admin/logout', { method: 'POST' });
    router.replace('/admin/login');
  }

  return (
    <div className="bg-white border-b border-gray-100 sticky top-0 z-20">
      <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Store size={18} className="text-brand-600" />
          <span className="font-bold text-sm text-gray-900">Vasudev Kirana · Admin</span>
        </div>
        <button onClick={logout} className="flex items-center gap-1 text-xs text-gray-500">
          <LogOut size={14} /> Logout
        </button>
      </div>
      <div className="max-w-5xl mx-auto px-4 flex gap-1 overflow-x-auto no-scrollbar">
        {ITEMS.map(({ href, label, icon: Icon }) => {
          const active = pathname?.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-1.5 px-3 py-2.5 text-xs font-medium border-b-2 whitespace-nowrap ${
                active ? 'border-brand-500 text-brand-600' : 'border-transparent text-gray-500'
              }`}
            >
              <Icon size={14} /> {label}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
