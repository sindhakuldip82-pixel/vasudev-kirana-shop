export type Lang = 'en' | 'gu';

export const translations = {
  shopTagline: { en: 'Your groceries, delivered to your doorstep.', gu: 'તમારો સામાન, હવે ઘરે બેઠા!' },
  shopNow: { en: 'Shop Now', gu: 'હમણાં ખરીદો' },
  orderOnWhatsApp: { en: 'Order on WhatsApp', gu: 'વોટ્સએપ પર ઓર્ડર કરો' },
  searchProducts: { en: 'Search products', gu: 'પ્રોડક્ટ શોધો' },
  addToCart: { en: 'Add to Cart', gu: 'કાર્ટમાં ઉમેરો' },
  buyNow: { en: 'Buy Now', gu: 'હમણાં ખરીદો' },
  homeDelivery: { en: 'Home Delivery', gu: 'ઘરે ડિલિવરી' },
  placeOrder: { en: 'Place Order', gu: 'ઓર્ડર કરો' },
  categories: { en: 'Categories', gu: 'શ્રેણીઓ' },
  popularProducts: { en: 'Popular Products', gu: 'લોકપ્રિય પ્રોડક્ટ્સ' },
  todaysOffers: { en: "Today's Offers", gu: 'આજની ઓફર' },
  howItWorks: { en: 'How It Works', gu: 'કેવી રીતે કામ કરે છે' },
  home: { en: 'Home', gu: 'હોમ' },
  orders: { en: 'Orders', gu: 'ઓર્ડર' },
  cart: { en: 'Cart', gu: 'કાર્ટ' },
  account: { en: 'Account', gu: 'ખાતું' },
  outOfStock: { en: 'Out of stock', gu: 'સ્ટોકમાં નથી' },
  lowStock: { en: 'Only a few left', gu: 'ઓછો સ્ટોક' },
  inStock: { en: 'In stock', gu: 'સ્ટોકમાં છે' },
  chooseQuantity: { en: 'Choose quantity', gu: 'જથ્થો પસંદ કરો' },
  total: { en: 'Total', gu: 'કુલ' },
  subtotal: { en: 'Subtotal', gu: 'પેટા કુલ' },
  deliveryFee: { en: 'Delivery Fee', gu: 'ડિલિવરી ચાર્જ' },
  discount: { en: 'Discount', gu: 'છૂટ' },
  emptyCart: { en: 'Your cart is empty', gu: 'તમારી કાર્ટ ખાલી છે' },
  useMyLocation: { en: 'Use my current location', gu: 'મારું હાલનું સ્થાન વાપરો' },
  customerName: { en: 'Full name', gu: 'પૂરું નામ' },
  mobileNumber: { en: 'Mobile number', gu: 'મોબાઇલ નંબર' },
  houseNumber: { en: 'House number', gu: 'ઘર નંબર' },
  streetArea: { en: 'Street / Area', gu: 'શેરી / વિસ્તાર' },
  landmark: { en: 'Landmark', gu: 'નજીકનું સ્થળ' },
  village: { en: 'Village', gu: 'ગામ' },
  deliveryInstructions: { en: 'Delivery instructions (optional)', gu: 'ડિલિવરી સૂચનાઓ (વૈકલ્પિક)' },
  paymentMethod: { en: 'Payment method', gu: 'ચુકવણી પદ્ધતિ' },
  cashOnDelivery: { en: 'Cash on Delivery', gu: 'ડિલિવરી પર રોકડ' },
  orderPlaced: { en: 'Order placed successfully!', gu: 'ઓર્ડર સફળતાપૂર્વક કરવામાં આવ્યો!' },
  orderNumber: { en: 'Order number', gu: 'ઓર્ડર નંબર' },
  estimatedDelivery: { en: 'Estimated delivery', gu: 'અંદાજિત ડિલિવરી સમય' },
  shopClosed: { en: 'Shop is currently closed', gu: 'દુકાન અત્યારે બંધ છે' },
  freeDeliveryAbove: { en: 'Free delivery above', gu: 'આ રકમથી ઉપર મફત ડિલિવરી' },
  viewCart: { en: 'View Cart', gu: 'કાર્ટ જુઓ' },
  remove: { en: 'Remove', gu: 'દૂર કરો' },
  currentLocation: { en: 'Current location captured', gu: 'હાલનું સ્થાન મેળવ્યું' },
  locationDenied: {
    en: 'Location permission denied. Please enter your address manually.',
    gu: 'સ્થાનની પરવાનગી નકારી. કૃપા કરી સરનામું જાતે દાખલ કરો.',
  },
} as const;

export type TranslationKey = keyof typeof translations;

export function t(key: TranslationKey, lang: Lang): string {
  return translations[key][lang];
}
