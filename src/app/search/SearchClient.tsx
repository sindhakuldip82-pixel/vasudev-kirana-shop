'use client';

import { Product } from '@/types';
import ProductCard from '@/components/ProductCard';

export default function SearchClient({ query, results }: { query: string; results: Product[] }) {
  return (
    <div className="px-4 pt-4">
      <h1 className="text-sm text-gray-500 mb-4">
        {results.length} result{results.length !== 1 ? 's' : ''} for &ldquo;{query}&rdquo;
      </h1>
      {results.length === 0 ? (
        <p className="text-sm text-gray-500 text-center py-10">
          No products found. Try a different search term.
        </p>
      ) : (
        <div className="grid grid-cols-2 gap-3 pb-6">
          {results.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      )}
    </div>
  );
}
