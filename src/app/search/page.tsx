import { readData } from '@/lib/db';
import SearchClient from './SearchClient';

export const dynamic = 'force-dynamic';

export default function SearchPage({ searchParams }: { searchParams: { q?: string } }) {
  const data = readData();
  const q = (searchParams.q || '').trim().toLowerCase();

  const results = q
    ? data.products.filter((p) => {
        if (!p.isActive) return false;
        const category = data.categories.find((c) => c.id === p.categoryId);
        return (
          p.name.toLowerCase().includes(q) ||
          (p.gujaratiName || '').includes(q) ||
          (category?.name.toLowerCase().includes(q) ?? false) ||
          (category?.gujaratiName || '').includes(q)
        );
      })
    : [];

  return <SearchClient query={searchParams.q || ''} results={results} />;
}
