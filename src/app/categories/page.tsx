import { readData } from '@/lib/db';
import CategoriesClient from './CategoriesClient';

export const dynamic = 'force-dynamic';

export default function CategoriesPage() {
  const data = readData();
  const categories = data.categories.filter((c) => c.isActive).sort((a, b) => a.sortOrder - b.sortOrder);
  return <CategoriesClient categories={categories} />;
}
