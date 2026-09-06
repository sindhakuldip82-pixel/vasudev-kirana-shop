import { Product, QuantityOption } from '@/types';

/**
 * Core pricing engine.
 *
 * WEIGHT / VOLUME products store a basePrice per kg (or per litre).
 * The customer selects an amount in grams (or ml); price is calculated
 * proportionally and NOT rounded unless the shop enables a rounding rule
 * (kept simple here: no auto-rounding, matching the spec).
 */

const DEFAULT_WEIGHT_OPTIONS_G = [100, 250, 500, 750, 1000, 1500, 2000];
const DEFAULT_VOLUME_OPTIONS_ML = [100, 250, 500, 750, 1000, 2000];

/** Generate the standard quantity picker options for a product. */
export function getQuantityOptions(product: Product): QuantityOption[] {
  if (product.sellingType === 'weight' || product.sellingType === 'volume') {
    const min = Math.max(1, product.minQuantityGrams || 100);
    const step = Math.max(1, product.stepGrams || 50);
    const defaults = product.sellingType === 'weight' ? DEFAULT_WEIGHT_OPTIONS_G : DEFAULT_VOLUME_OPTIONS_ML;
    const max = Math.max(...defaults, min);
    const values = defaults.filter((v) => v >= min);
    if (!values.includes(min)) values.unshift(min);
    // If a custom step is configured, generate a useful picker up to the standard max.
    if (step !== 50 && step !== 250) {
      values.length = 0;
      for (let v = min; v <= max; v += step) values.push(v);
      if (!values.includes(max)) values.push(max);
    }
    return [...new Set(values)].sort((a,b) => a-b).map((v) => ({
      label: product.sellingType === 'volume' ? formatMl(v) : formatGrams(v),
      grams: v,
    }));
  }

  if (product.sellingType === 'piece') {
    return [1, 2, 3, 4, 5, 6].map((p) => ({ label: `${p} pc${p > 1 ? 's' : ''}`, pieces: p }));
  }

  if (product.sellingType === 'fixed_pack') {
    return (product.variants || []).filter((v) => v.isActive).map((v) => ({ label: v.label, variantId: v.id }));
  }

  return [];
}

/** Format grams into a friendly label: 100 -> "100g", 1000 -> "1kg", 1500 -> "1.5kg" */
export function formatGrams(grams: number): string {
  if (grams >= 1000) {
    const kg = grams / 1000;
    return `${trimNumber(kg)}kg`;
  }
  return `${grams}g`;
}

export function formatMl(ml: number): string {
  if (ml >= 1000) {
    const l = ml / 1000;
    return `${trimNumber(l)}L`;
  }
  return `${ml}ml`;
}

function trimNumber(n: number): string {
  return Number.isInteger(n) ? String(n) : String(parseFloat(n.toFixed(2)));
}

/**
 * Calculate the price for a given quantity of a product.
 * Returns the calculated price (unrounded, precise to paise).
 */
export function calculatePrice(
  product: Product,
  option: { grams?: number; pieces?: number; variantId?: string }
): number {
  if (product.sellingType === 'weight' || product.sellingType === 'volume') {
    if (!product.basePrice || !option.grams) return 0;
    // basePrice is per kg (1000g) or per litre (1000ml)
    const pricePerUnit = product.basePrice / 1000;
    return roundToPaise(pricePerUnit * option.grams);
  }

  if (product.sellingType === 'piece') {
    if (!product.piecePrice || !option.pieces) return 0;
    return roundToPaise(product.piecePrice * option.pieces);
  }

  if (product.sellingType === 'fixed_pack') {
    const variant = (product.variants || []).find((v) => v.id === option.variantId);
    return variant ? variant.price : 0;
  }

  return 0;
}

/** Round to 2 decimal places (nearest paise) without arbitrary MRP-style rounding. */
function roundToPaise(value: number): number {
  return Math.round(value * 100) / 100;
}

/** The "unit price" to show under the price, e.g. "₹52/kg" or "₹10/pc" */
export function getUnitPriceLabel(product: Product): string {
  if (product.sellingType === 'weight') return `₹${product.basePrice}/kg`;
  if (product.sellingType === 'volume') return `₹${product.basePrice}/litre`;
  if (product.sellingType === 'piece') return `₹${product.piecePrice}/pc`;
  if (product.sellingType === 'fixed_pack') {
    const first = (product.variants || [])[0];
    return first ? `${first.label}` : '';
  }
  return '';
}

/** The lowest price shown on a product card (e.g. "from ₹5.20" for 100g of ₹52/kg sugar). */
export function getDisplayPrice(product: Product): number {
  if (product.sellingType === 'weight' || product.sellingType === 'volume') {
    const min = product.minQuantityGrams || 100;
    return calculatePrice(product, { grams: min });
  }
  if (product.sellingType === 'piece') {
    return calculatePrice(product, { pieces: 1 });
  }
  if (product.sellingType === 'fixed_pack') {
    const variants = (product.variants || []).filter((v) => v.isActive);
    if (variants.length === 0) return 0;
    return Math.min(...variants.map((v) => v.price));
  }
  return 0;
}

/** Compute delivery fee given subtotal + settings. */
export function calculateDeliveryFee(
  subtotal: number,
  settings: { freeDeliveryAboveAmount: number; deliveryFeeBelowMinimum: number }
): number {
  if (subtotal <= 0) return 0;
  if (subtotal >= settings.freeDeliveryAboveAmount) return 0;
  return settings.deliveryFeeBelowMinimum;
}
