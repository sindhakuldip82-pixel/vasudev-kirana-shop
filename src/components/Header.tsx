'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Search, ShoppingCart, User } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { useLanguage } from '@/context/LanguageContext';
import LanguageToggle from './LanguageToggle';

export default function Header() {
  const { itemCount } = useCart();
  const { t } = useLanguage();
  const router = useRouter();
  const [query, setQuery] = useState('');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) router.push(`/search?q=${encodeURIComponent(query.trim())}`);
  };

  return (
    <header className="sticky top-0 z-30 bg-white border-b border-gray-100 shadow-sm">
      <div className="max-w-4xl mx-auto px-3 pt-2.5 pb-2">
        <div className="flex items-center justify-between gap-2">
          <Link href="/" className="flex items-center gap-2 min-w-0">
            <div className="w-9 h-9 rounded-full bg-brand-500 text-white flex items-center justify-center text-lg shrink-0">
              🛒
            </div>
            <div className="min-w-0">
              <p className="font-bold text-sm leading-tight text-gray-900 truncate">
                Vasudev Kirana Shop
              </p>
              <p className="text-[11px] text-gray-500 leading-tight">Dhuvaran, Gujarat</p>
            </div>
          </Link>
          <div className="flex items-center gap-1.5 shrink-0">
            <LanguageToggle />
            <Link
              href="/cart"
              className="relative w-9 h-9 rounded-full bg-brand-50 flex items-center justify-center"
              aria-label="Cart"
            >
              <ShoppingCart size={18} className="text-brand-700" />
              {itemCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-accent-500 text-white text-[10px] font-bold rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1">
                  {itemCount}
                </span>
              )}
            </Link>
            <Link
              href="/account"
              className="w-9 h-9 rounded-full bg-brand-50 flex items-center justify-center"
              aria-label="Account"
            >
              <User size={18} className="text-brand-700" />
            </Link>
          </div>
        </div>
        <form onSubmit={handleSearch} className="mt-2.5 relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t('searchProducts')}
            className="w-full bg-gray-100 rounded-full pl-9 pr-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-brand-300"
          />
        </form>
      </div>
    </header>
  );
}
