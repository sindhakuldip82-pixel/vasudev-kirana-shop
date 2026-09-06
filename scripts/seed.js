// Regenerates data/db.json with fresh demo data.
// Run with: npm run seed  (WARNING: overwrites current products/categories;
// existing orders are preserved unless you delete data/db.json first).
const fs = require('fs');
const path = require('path');

const now = new Date().toISOString();

const categories = [
  { id: 'cat-grocery', name: 'Grocery', gujaratiName: 'કરિયાણું', slug: 'grocery', icon: '🛒', sortOrder: 1, isActive: true },
  { id: 'cat-atta-rice', name: 'Atta & Rice', gujaratiName: 'લોટ અને ચોખા', slug: 'atta-rice', icon: '🌾', sortOrder: 2, isActive: true },
  { id: 'cat-dal', name: 'Dal & Pulses', gujaratiName: 'દાળ', slug: 'dal-pulses', icon: '🫘', sortOrder: 3, isActive: true },
  { id: 'cat-oil-ghee', name: 'Oil & Ghee', gujaratiName: 'તેલ અને ઘી', slug: 'oil-ghee', icon: '🫙', sortOrder: 4, isActive: true },
  { id: 'cat-snacks', name: 'Snacks & Biscuits', gujaratiName: 'નાસ્તો અને બિસ્કિટ', slug: 'snacks-biscuits', icon: '🍪', sortOrder: 5, isActive: true },
  { id: 'cat-beverages', name: 'Beverages', gujaratiName: 'પીણાં', slug: 'beverages', icon: '🥤', sortOrder: 6, isActive: true },
  { id: 'cat-dairy', name: 'Dairy', gujaratiName: 'ડેરી', slug: 'dairy', icon: '🥛', sortOrder: 7, isActive: true },
  { id: 'cat-personal-care', name: 'Personal Care', gujaratiName: 'વ્યક્તિગત સંભાળ', slug: 'personal-care', icon: '🧴', sortOrder: 8, isActive: true },
  { id: 'cat-home-cleaning', name: 'Home Cleaning', gujaratiName: 'ઘર સફાઈ', slug: 'home-cleaning', icon: '🧹', sortOrder: 9, isActive: true },
  { id: 'cat-household', name: 'Household', gujaratiName: 'ઘરવપરાશ', slug: 'household', icon: '🏠', sortOrder: 10, isActive: true },
  { id: 'cat-baby-care', name: 'Baby Care', gujaratiName: 'બાળ સંભાળ', slug: 'baby-care', icon: '🍼', sortOrder: 11, isActive: true },
  { id: 'cat-other', name: 'Other', gujaratiName: 'અન્ય', slug: 'other', icon: '📦', sortOrder: 12, isActive: true },
];

function img(seed) {
  return `https://images.unsplash.com/${seed}?auto=format&fit=crop&w=400&q=60`;
}

const products = [
  {
    id: 'prod-sugar', name: 'Sugar', gujaratiName: 'ખાંડ', slug: 'sugar', categoryId: 'cat-grocery',
    description: 'Fine white sugar, sold by weight.', image: img('photo-1610725664285-7c57e6eeac3f'),
    sellingType: 'weight', basePrice: 52, baseUnit: 'kg', minQuantityGrams: 100, stepGrams: 50,
    stock: 25000, stockStatus: 'in_stock', isActive: true, isFeatured: true, createdAt: now, updatedAt: now,
  },
  {
    id: 'prod-rice', name: 'Rice', gujaratiName: 'ચોખા', slug: 'rice', categoryId: 'cat-atta-rice',
    description: 'Everyday sona masoori rice.', image: img('photo-1586201375761-83865001e31c'),
    sellingType: 'weight', basePrice: 60, baseUnit: 'kg', minQuantityGrams: 500, stepGrams: 250,
    stock: 40000, stockStatus: 'in_stock', isActive: true, isFeatured: true, createdAt: now, updatedAt: now,
  },
  {
    id: 'prod-wheat-flour', name: 'Wheat Flour', gujaratiName: 'ઘઉંનો લોટ', slug: 'wheat-flour', categoryId: 'cat-atta-rice',
    description: 'Freshly milled atta.', image: img('photo-1595855759920-86582396756c'),
    sellingType: 'weight', basePrice: 62, baseUnit: 'kg', minQuantityGrams: 500, stepGrams: 250,
    stock: 30000, stockStatus: 'in_stock', isActive: true, isFeatured: true, createdAt: now, updatedAt: now,
  },
  {
    id: 'prod-toor-dal', name: 'Toor Dal', gujaratiName: 'તુવેર દાળ', slug: 'toor-dal', categoryId: 'cat-dal',
    description: 'Premium quality toor dal.', image: img('photo-1612257999691-9e88b62b6f19'),
    sellingType: 'weight', basePrice: 160, baseUnit: 'kg', minQuantityGrams: 250, stepGrams: 250,
    stock: 15000, stockStatus: 'in_stock', isActive: true, isFeatured: false, createdAt: now, updatedAt: now,
  },
  {
    id: 'prod-moong-dal', name: 'Moong Dal', gujaratiName: 'મગની દાળ', slug: 'moong-dal', categoryId: 'cat-dal',
    description: 'Yellow split moong dal.', image: img('photo-1612257999691-9e88b62b6f19'),
    sellingType: 'weight', basePrice: 140, baseUnit: 'kg', minQuantityGrams: 250, stepGrams: 250,
    stock: 12000, stockStatus: 'in_stock', isActive: true, isFeatured: false, createdAt: now, updatedAt: now,
  },
  {
    id: 'prod-cooking-oil', name: 'Cooking Oil', gujaratiName: 'ખાદ્ય તેલ', slug: 'cooking-oil', categoryId: 'cat-oil-ghee',
    description: 'Refined sunflower cooking oil, sold by volume.', image: img('photo-1474979266404-7eaacbcd87c5'),
    sellingType: 'volume', basePrice: 150, baseUnit: 'litre', minQuantityGrams: 250, stepGrams: 250,
    stock: 20000, stockStatus: 'in_stock', isActive: true, isFeatured: true, offerBadge: '5% OFF', createdAt: now, updatedAt: now,
  },
  {
    id: 'prod-tea', name: 'Tea', gujaratiName: 'ચા', slug: 'tea', categoryId: 'cat-beverages',
    description: 'Strong Assam tea leaves, fixed pack.', image: img('photo-1544787219-7f47ccb76574'),
    sellingType: 'fixed_pack', stock: 100, stockStatus: 'in_stock', isActive: true, isFeatured: true,
    variants: [{ id: 'var-tea-250', label: '250 g', price: 125, stock: 100, isActive: true }],
    createdAt: now, updatedAt: now,
  },
  {
    id: 'prod-biscuits', name: 'Biscuits', gujaratiName: 'બિસ્કિટ', slug: 'biscuits', categoryId: 'cat-snacks',
    description: 'Glucose biscuits, sold per packet.', image: img('photo-1558326567-98ae2405596b'),
    sellingType: 'piece', piecePrice: 10, stock: 200, stockStatus: 'in_stock', isActive: true, isFeatured: true,
    createdAt: now, updatedAt: now,
  },
  {
    id: 'prod-milk', name: 'Milk', gujaratiName: 'દૂધ', slug: 'milk', categoryId: 'cat-dairy',
    description: 'Amul toned milk pouch.', image: img('photo-1550583724-b2692b85b150'),
    sellingType: 'fixed_pack', stock: 60, stockStatus: 'in_stock', isActive: true, isFeatured: true,
    variants: [{ id: 'var-milk-500', label: '500 ml', price: 30, stock: 60, isActive: true }],
    createdAt: now, updatedAt: now,
  },
  {
    id: 'prod-detergent', name: 'Detergent', gujaratiName: 'ડિટર્જન્ટ', slug: 'detergent', categoryId: 'cat-home-cleaning',
    description: 'Washing powder, sold by weight.', image: img('photo-1585421514738-01798e348b17'),
    sellingType: 'weight', basePrice: 95, baseUnit: 'kg', minQuantityGrams: 250, stepGrams: 250,
    stock: 18000, stockStatus: 'in_stock', isActive: true, isFeatured: false, createdAt: now, updatedAt: now,
  },
  {
    id: 'prod-soap', name: 'Bath Soap', gujaratiName: 'નહાવાનો સાબુ', slug: 'bath-soap', categoryId: 'cat-personal-care',
    description: 'Everyday bath soap bar.', image: img('photo-1584305574647-0cc949a2bb9f'),
    sellingType: 'piece', piecePrice: 35, stock: 150, stockStatus: 'in_stock', isActive: true, isFeatured: false,
    createdAt: now, updatedAt: now,
  },
];

const dbPath = path.join(__dirname, '..', 'data', 'db.json');
let existingOrders = [];
if (fs.existsSync(dbPath)) {
  try {
    const existing = JSON.parse(fs.readFileSync(dbPath, 'utf-8'));
    existingOrders = existing.orders || [];
  } catch (e) {}
}

const data = {
  products,
  categories,
  orders: existingOrders,
  deliverySettings: {
    freeDeliveryAboveAmount: 300,
    deliveryFeeBelowMinimum: 15,
    minimumOrderAmount: 0,
    deliveryRadiusKm: 5,
    estimatedDeliveryMinutes: 45,
    isShopOpen: true,
  },
  shopSettings: {
    shopName: 'Vasudev Kirana Shop',
    shopNameGujarati: 'વાસુદેવ કરિયાણા સ્ટોર',
    address: 'Main Bazar, Dhuvaran',
    village: 'Dhuvaran',
    whatsappNumber: '918799631012',
    phoneNumber: '918799631012',
    openingHours: '8:00 AM - 9:00 PM',
    logo: '',
    upiId: '',
    googleMapsLink: '',
  },
};

fs.writeFileSync(dbPath, JSON.stringify(data, null, 2), 'utf-8');
console.log(`Seeded ${products.length} products, ${categories.length} categories into ${dbPath}`);
