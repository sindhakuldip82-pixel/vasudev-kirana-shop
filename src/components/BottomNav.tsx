'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, LayoutGrid, ClipboardList, ShoppingCart, User } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { useLanguage } from '@/context/LanguageContext';

export default function BottomNav() {
  const pathname = usePathname();
  const { itemCount } = useCart();
  const { t } = useLanguage();

  const items = [
    { href: '/', label: t('home'), icon: Home },
    { href: '/categories', label: t('categories'), icon: LayoutGrid },
    { href: '/orders', label: t('orders'), icon: ClipboardList },
    { href: '/cart', label: t('cart'), icon: ShoppingCart, badge: itemCount },
    { href: '/account', label: t('account'), icon: User },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-30 bg-white border-t border-gray-100 pb-[env(safe-area-inset-bottom)]">
      <div className="max-w-4xl mx-auto grid grid-cols-5">
        {items.map(({ href, label, icon: Icon, badge }) => {
          const active = href === '/' ? pathname === '/' : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className="flex flex-col items-center justify-center gap-0.5 py-2 relative"
            >
              <div className="relative">
                <Icon size={20} className={active ? 'text-brand-600' : 'text-gray-400'} strokeWidth={active ? 2.5 : 2} />
                {!!badge && (
                  <span className="absolute -top-1.5 -right-2 bg-accent-500 text-white text-[9px] font-bold rounded-full min-w-[16px] h-4 flex items-center justify-center px-1">
                    {badge}
                  </span>
                )}
              </div>
              <span className={`text-[10px] ${active ? 'text-brand-600 font-semibold' : 'text-gray-400'}`}>
                {label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
