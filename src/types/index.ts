// ============================================================
// Core domain types for Vasudev Kirana Shop
// ============================================================

export type SellingType = 'weight' | 'volume' | 'piece' | 'fixed_pack';

export type BaseUnit = 'kg' | 'litre';

/** A fixed-price pack option, e.g. "500 ml" => ₹30 */
export interface PackVariant {
  id: string;
  label: string; // "500 ml", "1 kg bag", "Small"
  labelGujarati?: string;
  price: number;
  mrp?: number; // compare-at price
  stock: number;
  isActive: boolean;
}

export interface Product {
  id: string;
  name: string;
  gujaratiName?: string;
  slug: string;
  categoryId: string;
  description?: string;
  descriptionGujarati?: string;
  image: string; // URL
  sellingType: SellingType;

  // WEIGHT / VOLUME products: price is per base unit (per kg or per litre)
  basePrice?: number; // e.g. 52 (rupees per kg)
  baseUnit?: BaseUnit; // 'kg' | 'litre'
  minQuantityGrams?: number; // smallest orderable amount, default 100 (or 100ml)
  stepGrams?: number; // increment step, default 50

  // PIECE products: price is per single piece
  piecePrice?: number;

  // FIXED_PACK products: price(s) fixed regardless of quantity, one or more variants
  variants?: PackVariant[];

  mrp?: number; // "compare at" price for weight/volume/piece products
  stock: number; // stock units: grams for weight, ml for volume, pieces for piece.
  stockStatus: 'in_stock' | 'low_stock' | 'out_of_stock';
  isActive: boolean;
  isFeatured: boolean;
  offerBadge?: string; // e.g. "10% OFF", "New"
  createdAt: string;
  updatedAt: string;
}

export interface Category {
  id: string;
  name: string;
  gujaratiName?: string;
  slug: string;
  icon?: string; // emoji or icon name
  sortOrder: number;
  isActive: boolean;
}

/** A single selectable quantity option shown to the customer, e.g. "500g" */
export interface QuantityOption {
  label: string; // "500g", "1L", "2 pcs"
  grams?: number; // for weight/volume, amount in grams or ml
  pieces?: number; // for piece products
  variantId?: string; // for fixed_pack products
}

export interface CartItem {
  id: string; // unique cart line id
  productId: string;
  productName: string;
  productGujaratiName?: string;
  image: string;
  sellingType: SellingType;
  // the chosen quantity, in a normalized display form:
  quantityLabel: string; // "500g", "2 pcs", "1 L"
  quantityValue: number; // grams, ml, or pieces (the raw amount)
  variantId?: string; // for fixed_pack
  unitPrice: number; // price per kg/litre/piece at time of adding, or pack price
  lineTotal: number; // calculated total for this line
  count: number; // how many of this quantity/variant (e.g. "500g x 2")
}

export type OrderStatus =
  | 'NEW'
  | 'ACCEPTED'
  | 'PACKING'
  | 'OUT_FOR_DELIVERY'
  | 'DELIVERED'
  | 'CANCELLED';

export interface OrderItem {
  productId: string;
  productName: string;
  productGujaratiName?: string;
  image: string;
  sellingType: SellingType;
  quantityLabel: string;
  quantityValue: number;
  variantId?: string;
  unitPrice: number; // price basis at time of order (per kg/litre/piece, or pack price)
  calculatedPrice: number; // total for this line at order time (immutable)
  count: number;
}

export interface DeliveryAddress {
  houseNumber?: string;
  streetArea?: string;
  landmark?: string;
  village: string;
  phone: string;
  latitude?: number;
  longitude?: number;
}

export interface Order {
  id: string;
  orderNumber: string; // human friendly, e.g. VKS-000123
  customerName: string;
  phone: string;
  address: DeliveryAddress;
  items: OrderItem[];
  subtotal: number;
  deliveryFee: number;
  discount: number;
  total: number;
  paymentMethod: 'COD' | 'UPI' | 'ONLINE';
  deliveryInstructions?: string;
  status: OrderStatus;
  orderedVia: 'WEBSITE' | 'WHATSAPP';
  estimatedDeliveryMinutes?: number;
  createdAt: string;
  updatedAt: string;
}

export interface DeliverySettings {
  freeDeliveryAboveAmount: number; // e.g. 300
  deliveryFeeBelowMinimum: number; // e.g. 15
  minimumOrderAmount: number; // e.g. 0 (no minimum) or e.g. 50
  deliveryRadiusKm: number;
  estimatedDeliveryMinutes: number;
  isShopOpen: boolean;
}

export interface ShopSettings {
  shopName: string;
  shopNameGujarati?: string;
  address: string;
  village: string;
  whatsappNumber: string; // digits only, international format
  phoneNumber: string;
  openingHours: string;
  logo?: string;
  upiId?: string;
  googleMapsLink?: string;
}

export interface AppData {
  products: Product[];
  categories: Category[];
  orders: Order[];
  deliverySettings: DeliverySettings;
  shopSettings: ShopSettings;
}
