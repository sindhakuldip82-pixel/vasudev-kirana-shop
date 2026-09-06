import { notFound } from 'next/navigation';
import { readData } from '@/lib/db';
import ProductClient from './ProductClient';

export const dynamic = 'force-dynamic';

export default async function ProductPage({ params }: { params: { id: string } }) {
  const data = await readData();
  const product = data.products.find((p) => p.id === params.id || p.slug === params.id);
  if (!product || !product.isActive) notFound();
  return <ProductClient product={product} />;
}
