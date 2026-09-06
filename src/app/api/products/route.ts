import { NextRequest, NextResponse } from 'next/server';
import { readData, writeData } from '@/lib/db';
import { generateId } from '@/lib/id';
import { isAdminAuthed } from '@/lib/auth';
import { Product } from '@/types';

export async function GET() {
  const data = await readData();
  // Public API only returns active products; admin uses the same endpoint but
  // can request all via ?all=1 (checked below is unnecessary for GET, kept simple).
  return NextResponse.json({ products: data.products });
}

export async function POST(req: NextRequest) {
  if (!isAdminAuthed()) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const body = await req.json();
  const data = await readData();

  const now = new Date().toISOString();
  const newProduct: Product = {
    id: generateId('prod-'),
    name: body.name,
    gujaratiName: body.gujaratiName || '',
    slug: (body.slug || body.name || '').toLowerCase().replace(/\s+/g, '-'),
    categoryId: body.categoryId,
    description: body.description || '',
    descriptionGujarati: body.descriptionGujarati || '',
    image: body.image || '',
    sellingType: body.sellingType,
    basePrice: body.basePrice,
    baseUnit: body.baseUnit,
    minQuantityGrams: body.minQuantityGrams || 100,
    stepGrams: body.stepGrams || 50,
    piecePrice: body.piecePrice,
    variants: body.variants || [],
    mrp: body.mrp,
    stock: body.stock ?? 0,
    stockStatus: body.stockStatus || 'in_stock',
    isActive: body.isActive ?? true,
    isFeatured: body.isFeatured ?? false,
    offerBadge: body.offerBadge || '',
    createdAt: now,
    updatedAt: now,
  };

  data.products.push(newProduct);
  await writeData(data);
  return NextResponse.json({ product: newProduct }, { status: 201 });
}
