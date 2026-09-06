import { notFound } from 'next/navigation';
import { readData } from '@/lib/db';
import CategoryClient from './CategoryClient';

export const dynamic = 'force-dynamic';

export default async function CategoryPage({ params }: { params: { slug: string } }) {
  const data = await readData();
  const category = data.categories.find((c) => c.slug === params.slug);
  if (!category) notFound();
  const products = data.products.filter((p) => p.isActive && p.categoryId === category.id);
  return <CategoryClient category={category} products={products} />;
}
