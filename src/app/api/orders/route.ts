import { NextRequest, NextResponse } from 'next/server';
import { readData, writeData, nextOrderNumber } from '@/lib/db';
import { generateId } from '@/lib/id';
import { isAdminAuthed } from '@/lib/auth';
import { isValidIndianMobile } from '@/lib/validation';
import { calculateDeliveryFee, calculatePrice } from '@/lib/pricing';
import { Order, OrderItem } from '@/types';

export async function GET(req: NextRequest) {
  const data = await readData();
  const { searchParams } = new URL(req.url);
  const phone = searchParams.get('phone');

  // Public: customers can only look up orders by their own phone number.
  if (phone) {
    const last10 = phone.replace(/\D/g, '').slice(-10);
    const orders = data.orders
      .filter((o) => o.phone.replace(/\D/g, '').slice(-10) === last10)
      .sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
    return NextResponse.json({ orders });
  }

  // Admin: full order list.
  if (!isAdminAuthed()) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const orders = [...data.orders].sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
  return NextResponse.json({ orders });
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const data = await readData();

  if (!data.deliverySettings.isShopOpen) {
    return NextResponse.json({ error: 'shop_closed' }, { status: 400 });
  }

  if (!body.customerName || !body.address?.village || !body.phone) {
    return NextResponse.json({ error: 'missing_fields' }, { status: 400 });
  }
  if (!isValidIndianMobile(body.phone)) {
    return NextResponse.json({ error: 'invalid_phone' }, { status: 400 });
  }
  if (!Array.isArray(body.items) || body.items.length === 0) {
    return NextResponse.json({ error: 'empty_cart' }, { status: 400 });
  }

  // Re-validate stock & recompute totals server-side (never trust client totals).
  const orderItems: OrderItem[] = [];
  let subtotal = 0;

  for (const cartItem of body.items) {
    const product = data.products.find((p) => p.id === cartItem.productId);
    if (!product || !product.isActive) {
      return NextResponse.json({ error: 'product_unavailable', productId: cartItem.productId }, { status: 400 });
    }
    if (product.stockStatus === 'out_of_stock') {
      return NextResponse.json({ error: 'out_of_stock', productId: cartItem.productId }, { status: 400 });
    }

    // Recompute the price from the product's CURRENT price using the pricing
    // engine — never trust cartItem.lineTotal / unitPrice sent by the client.
    const singleUnitPrice = calculatePrice(product, {
      grams:
        product.sellingType === 'weight' || product.sellingType === 'volume'
          ? cartItem.quantityValue
          : undefined,
      pieces: product.sellingType === 'piece' ? cartItem.quantityValue : undefined,
      variantId: product.sellingType === 'fixed_pack' ? cartItem.variantId : undefined,
    });
    const count = Math.max(1, Number(cartItem.count) || 1);
    const calculatedPrice = Math.round(singleUnitPrice * count * 100) / 100;
    const unitPriceBasis =
      product.sellingType === 'weight' || product.sellingType === 'volume'
        ? product.basePrice || 0
        : product.sellingType === 'piece'
        ? product.piecePrice || 0
        : singleUnitPrice;

    const item: OrderItem = {
      productId: product.id,
      productName: product.name,
      productGujaratiName: product.gujaratiName,
      image: product.image,
      sellingType: product.sellingType,
      quantityLabel: cartItem.quantityLabel,
      quantityValue: cartItem.quantityValue,
      variantId: cartItem.variantId,
      unitPrice: unitPriceBasis,
      calculatedPrice,
      count,
    };
    orderItems.push(item);
    subtotal += item.calculatedPrice;
  }

  const deliveryFee = calculateDeliveryFee(subtotal, data.deliverySettings);
  const discount = 0;
  const total = subtotal + deliveryFee - discount;

  const now = new Date().toISOString();
  const order: Order = {
    id: generateId('order-'),
    orderNumber: nextOrderNumber(data),
    customerName: body.customerName,
    phone: body.phone,
    address: {
      houseNumber: body.address.houseNumber || '',
      streetArea: body.address.streetArea || '',
      landmark: body.address.landmark || '',
      village: body.address.village,
      phone: body.phone,
      latitude: body.address.latitude,
      longitude: body.address.longitude,
    },
    items: orderItems,
    subtotal,
    deliveryFee,
    discount,
    total,
    paymentMethod: body.paymentMethod || 'COD',
    deliveryInstructions: body.deliveryInstructions || '',
    status: 'NEW',
    orderedVia: body.orderedVia === 'WHATSAPP' ? 'WHATSAPP' : 'WEBSITE',
    estimatedDeliveryMinutes: data.deliverySettings.estimatedDeliveryMinutes,
    createdAt: now,
    updatedAt: now,
  };

  data.orders.push(order);
  try {
    await writeData(data);
  } catch (error) {
    console.error('Order persistence failed:', error);
    return NextResponse.json({ error: 'storage_unavailable' }, { status: 503 });
  }

  return NextResponse.json({ order }, { status: 201 });
}
