import { readData } from '@/lib/db';
import HomeClient from './HomeClient';

export const dynamic = 'force-dynamic';

export default function HomePage() {
  const data = readData();
  const activeProducts = data.products.filter((p) => p.isActive);
  const featured = activeProducts.filter((p) => p.isFeatured);
  const offers = activeProducts.filter((p) => !!p.offerBadge);
  const categories = data.categories.filter((c) => c.isActive).sort((a, b) => a.sortOrder - b.sortOrder);

  return (
    <HomeClient
      categories={categories}
      featured={featured}
      offers={offers}
      shopSettings={data.shopSettings}
      isShopOpen={data.deliverySettings.isShopOpen}
      freeDeliveryAbove={data.deliverySettings.freeDeliveryAboveAmount}
    />
  );
}
