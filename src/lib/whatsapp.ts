import { CartItem, DeliveryAddress, ShopSettings } from '@/types';

export interface WhatsAppOrderInput {
  shopSettings: ShopSettings;
  customerName: string;
  address: DeliveryAddress;
  items: CartItem[];
  subtotal: number;
  deliveryFee: number;
  discount: number;
  total: number;
}

/** Build the plain-text WhatsApp order message described in the spec. */
export function buildWhatsAppMessage(input: WhatsAppOrderInput): string {
  const { shopSettings, customerName, address, items, subtotal, deliveryFee, discount, total } =
    input;

  const lines: string[] = [];
  lines.push(`*${shopSettings.shopName} Order*`);
  lines.push('');
  lines.push('Customer:');
  lines.push(customerName);
  lines.push(address.phone);
  lines.push(formatAddress(address));
  lines.push('');
  lines.push('Products:');
  for (const item of items) {
    lines.push(
      `${item.productName} - ${item.quantityLabel}${item.count > 1 ? ` x ${item.count}` : ''} = ₹${item.lineTotal.toFixed(2)}`
    );
  }
  lines.push('');
  lines.push(`Subtotal: ₹${subtotal.toFixed(2)}`);
  lines.push(`Delivery: ₹${deliveryFee.toFixed(2)}`);
  if (discount > 0) lines.push(`Discount: -₹${discount.toFixed(2)}`);
  lines.push(`Total: ₹${total.toFixed(2)}`);

  if (address.latitude && address.longitude) {
    lines.push('');
    lines.push('Location:');
    lines.push(`https://maps.google.com/?q=${address.latitude},${address.longitude}`);
  }

  return lines.join('\n');
}

function formatAddress(address: DeliveryAddress): string {
  const parts = [address.houseNumber, address.streetArea, address.landmark, address.village].filter(
    Boolean
  );
  return parts.join(', ');
}

/** Build the wa.me deep link that opens WhatsApp with the message pre-filled. */
export function buildWhatsAppLink(phoneNumberDigitsOnly: string, message: string): string {
  const encoded = encodeURIComponent(message);
  return `https://wa.me/${phoneNumberDigitsOnly}?text=${encoded}`;
}
