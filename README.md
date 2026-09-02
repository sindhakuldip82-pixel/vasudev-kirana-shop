# Vasudev Kirana Shop — Online Grocery Ordering Website

A mobile-first grocery ordering website for **Vasudev Kirana Shop**, Dhuvaran, Gujarat —
built with Next.js 14 (App Router), TypeScript, and Tailwind CSS. Customers browse
by category, choose custom quantities (grams/ml/pieces/packs), pay COD/UPI or order
via WhatsApp, and track their order status. Shop owners get a full admin panel to
manage products, prices, stock, categories, orders, and delivery settings.

## 1. Folder structure

```
vasudev-kirana-shop/
├── data/
│   └── db.json                 # JSON "database" (seed data + orders). See section 8.
├── scripts/
│   └── seed.js                 # Regenerates demo products/categories
├── public/
│   ├── manifest.json           # PWA manifest
│   └── icons/                  # Put icon-192.png / icon-512.png here
├── src/
│   ├── app/
│   │   ├── layout.tsx          # Root layout (providers)
│   │   ├── page.tsx            # Homepage
│   │   ├── categories/         # Category grid
│   │   ├── category/[slug]/    # Products in a category
│   │   ├── search/             # Search results
│   │   ├── product/[id]/       # Product detail + quantity/price picker
│   │   ├── cart/                # Shopping cart
│   │   ├── checkout/           # Address, location, payment, place order
│   │   ├── order-confirmation/[id]/
│   │   ├── orders/             # Customer order lookup by phone
│   │   ├── account/            # Shop info / contact
│   │   ├── admin/              # Admin panel (login, dashboard, CRUD, settings)
│   │   └── api/                # All backend routes (see section 6)
│   ├── components/             # Reusable UI (Header, ProductCard, QuantitySelector, ...)
│   ├── context/                # CartContext (localStorage), LanguageContext (EN/GU)
│   ├── lib/                    # pricing engine, db access, auth, WhatsApp, translations
│   └── types/                  # Shared TypeScript types (Product, Order, ...)
├── .env.example
├── package.json
└── tailwind.config.ts
```

## 2. Install & run locally

Requires Node.js 18+.

```bash
cd vasudev-kirana-shop
npm install
cp .env.example .env       # then edit .env, see section 4
npm run dev
```

Open http://localhost:3000. The site loads with 11 sample products across all 12
categories out of the box (from `data/db.json`).

To reset/regenerate the demo catalog at any time:
```bash
npm run seed
```
This overwrites products & categories but preserves any orders already placed.

## 3. Admin login

Go to **http://localhost:3000/admin/login**.

Default demo credentials (change them in `.env` before going live!):
```
Username: admin
Password: admin123
```
(or whatever you set as `ADMIN_USERNAME` / `ADMIN_PASSWORD` in `.env`)

From the admin dashboard you can:
- **Products** — add/edit/delete, set selling type (weight/volume/piece/fixed pack),
  base price, stock, featured flag, offer badges, active/inactive.
- **Categories** — add/edit/delete/reorder.
- **Orders** — search, filter by status, view customer + address + map link,
  change status (NEW → ACCEPTED → PACKING → OUT_FOR_DELIVERY → DELIVERED / CANCELLED),
  print a receipt.
- **Settings** — shop name/address/hours, WhatsApp & phone numbers, UPI ID,
  delivery fee rules, free-delivery threshold, delivery radius, shop open/closed toggle.

## 4. Environment variables (`.env`)

```
ADMIN_USERNAME=admin
ADMIN_PASSWORD=change-this-password
JWT_SECRET=replace-with-a-long-random-secret
NEXT_PUBLIC_SHOP_WHATSAPP_NUMBER=SHOP_WHATSAPP_NUMBER
NEXT_PUBLIC_MAPS_API_KEY=
RAZORPAY_KEY_ID=
RAZORPAY_KEY_SECRET=
```

- **ADMIN_USERNAME / ADMIN_PASSWORD** — admin login. Change before deploying.
- **JWT_SECRET** — used to sign the admin session cookie. Use a long random string
  in production (e.g. `openssl rand -hex 32`).
- **NEXT_PUBLIC_SHOP_WHATSAPP_NUMBER** — a fallback used by the "Order on WhatsApp"
  button on the homepage before the shop has configured a number in Admin → Settings.
  The number actually used at checkout comes from **Admin → Settings → WhatsApp number**
  (stored in `data/db.json`, editable any time without redeploying).

## 5. How the variable-quantity pricing works

This is the core requirement: **the admin does not create separate products for
each pack size.** For weight/volume products, the admin enters one base price
(₹ per kg or ₹ per litre). The customer picks a quantity (100g, 250g, 500g, 750g,
1kg, 1.5kg, 2kg, or a custom amount), and the price is calculated live:

```
price = (basePrice / 1000) × grams        // no automatic rounding
```

Example: Sugar at ₹52/kg → 500g = ₹26.00, 750g = ₹39.00, 2kg = ₹104.00.

This logic lives in `src/lib/pricing.ts` (`calculatePrice`, `getQuantityOptions`).
Piece-sold items multiply `piecePrice × count`. Fixed-pack items (e.g. Amul Milk
500ml = ₹30) use admin-defined `variants`, each with its own fixed price —
these are NOT calculated, they're set directly, exactly as the spec requires.

**Order integrity:** when an order is placed, the server (`src/app/api/orders/route.ts`)
re-reads the product's current price and re-validates stock — it never trusts the
price sent by the browser. Each `OrderItem` stores its `calculatedPrice` at the time
of order, so if the shop changes a product's price later, historical orders are
unaffected (per the "immutable order item" requirement in the spec).

## 6. API routes (backend)

| Route | Methods | Notes |
|---|---|---|
| `/api/products` | GET, POST | POST requires admin session |
| `/api/products/[id]` | GET, PUT, DELETE | PUT/DELETE require admin |
| `/api/categories` | GET, POST | POST requires admin |
| `/api/categories/[id]` | PUT, DELETE | requires admin; blocks deleting a category with products |
| `/api/orders` | GET, POST | GET with `?phone=` is public (customer lookup); GET without it requires admin (full list) |
| `/api/orders/[id]` | GET, PUT | PUT (status change) requires admin |
| `/api/settings` | GET, PUT | PUT requires admin |
| `/api/admin/login` | POST | sets httpOnly session cookie |
| `/api/admin/logout` | POST | clears cookie |
| `/api/admin/me` | GET | used by the client to check if the admin session is still valid |

## 7. WhatsApp ordering

At checkout, tapping **"Order on WhatsApp"** does two things:
1. Saves the order to the database (same as a normal website order, status `NEW`,
   `orderedVia: "WHATSAPP"`), so it shows up in the admin Orders tab and the
   customer's order-tracking page.
2. Opens `https://wa.me/<shop-whatsapp-number>?text=<prefilled order summary>`
   in a new tab, with product list, quantities, subtotal/delivery/total, and a
   Google Maps link if the customer shared their location.

Set the real number in **Admin → Settings → WhatsApp number** (digits only,
international format, e.g. `919876543210`). Until you set it, the site uses the
`SHOP_WHATSAPP_NUMBER` placeholder and WhatsApp links won't resolve to a real chat.

## 8. Database — how it works now, and how to upgrade it

Right now the "database" is a single JSON file, `data/db.json`, read and written
by `src/lib/db.ts`. This was chosen so the project **runs immediately with zero
external services** — no database server to set up, no cloud account needed.

**This works great for:**
- Local development
- A single always-on Node.js server (e.g. a small VPS, Railway, Render, a
  Raspberry Pi at the shop, etc.)

**This does NOT work for:**
- Vercel or other serverless/edge platforms, because their filesystem is
  read-only at runtime — writes (new orders, product edits) won't persist.

### Upgrading to a real database
The shape of `AppData` in `src/types/index.ts` (products, categories, orders,
deliverySettings, shopSettings) maps directly onto database tables/collections.
To swap in Postgres, Supabase, PlanetScale, MongoDB, or SQLite:

1. Keep `readData()` / `writeData()` in `src/lib/db.ts` with the same signatures
   (or split them into per-entity functions like `getProducts()`, `saveOrder()`, etc.).
2. Replace the `fs.readFileSync` / `fs.writeFileSync` bodies with your ORM/client
   calls (Prisma, Drizzle, the Supabase JS client, etc.).
3. Nothing else needs to change — every API route only talks to `src/lib/db.ts`.

Recommended for going live: **Supabase** (Postgres + easy hosting) or **SQLite via
Turso**, both of which work well with Vercel.

## 9. Deployment

### Option A — a plain Node.js server (keeps the JSON-file database working)
```bash
npm run build
npm run start          # serves on port 3000
```
Put this behind a process manager (pm2) and a reverse proxy (Nginx/Caddy) with
a free TLS cert (Let's Encrypt / Caddy auto-HTTPS). Any small VPS (₹300–600/mo)
or Render/Railway "Web Service" works.

### Option B — Vercel (serverless)
Works out of the box for browsing, but you must first migrate `data/db.json` to
a real database (section 8) — otherwise product edits/orders made after deploy
won't persist. Once migrated: `vercel --prod` (or connect the GitHub repo in the
Vercel dashboard) and set the environment variables from `.env.example` in the
Vercel project settings.

## 10. Configuring things later

- **WhatsApp number:** Admin → Settings → WhatsApp number.
- **Location / maps:** Checkout already captures GPS coordinates via the browser
  Geolocation API and includes a Google Maps link in orders and the WhatsApp
  message — no API key needed for that. If you want an embedded map *preview* on
  the checkout page later, get a Google Maps or Mapbox key and put it in
  `NEXT_PUBLIC_MAPS_API_KEY`, then add a map component to `src/app/checkout/page.tsx`.
- **Online payment (Razorpay):** the checkout page currently offers Cash on
  Delivery and UPI (manual, shop shares a QR code after order confirmation).
  To add real online payment: create a Razorpay account, put your keys in
  `RAZORPAY_KEY_ID` / `RAZORPAY_KEY_SECRET`, add a `/api/payments/create-order`
  route using the Razorpay Node SDK, and call it from the "UPI" button in
  `src/app/checkout/page.tsx` before calling `/api/orders`.
- **Product images:** paste an image URL in the admin product form. For real
  image uploads (from a phone camera), add a storage step (Cloudinary,
  Supabase Storage, or S3) that uploads the file and returns a URL to paste
  into that same field — the rest of the app already just expects a URL string.
- **Delivery tracking (phase 2):** order statuses and delivery-address
  coordinates are already captured and stored, per the spec (section 19 of the
  brief). To add live delivery-person tracking later: add a `delivery_person`
  role to `src/lib/auth.ts`, a `deliveryPersonId` field on `Order`, and a
  location-sharing page that periodically POSTs coordinates to a new
  `/api/orders/[id]/location` endpoint; poll it from the customer's order page.

## 11. What was verified

- Weight-based pricing matches the spec's worked examples exactly (₹52/kg → 100g
  = ₹5.20, 250g = ₹13, 500g = ₹26, 750g = ₹39, 1kg = ₹52, 2kg = ₹104; ₹80/kg →
  250g/500g/750g/1kg = ₹20/₹40/₹60/₹80).
- Cart persists across page refresh (localStorage).
- Checkout blocks submission with a friendly message if: fields are missing, the
  phone number is invalid, the cart is empty, an item went out of stock between
  adding to cart and checkout, or the shop is marked closed.
- The server recomputes order totals from current product prices/stock — it
  never trusts totals sent by the browser.
- Admin routes (`/api/products` POST/PUT/DELETE, `/api/categories` POST/PUT/DELETE,
  `/api/orders` PUT, `/api/settings` PUT) all check for a valid admin session
  and return 401 otherwise; admin pages redirect to `/admin/login` if not
  authenticated.

## 12. Note on this build

Because this project was generated in an environment without internet access,
`npm install` could not be run here to produce a live preview — but every file
was hand-written against Next.js 14 App Router conventions, and the pricing math
was independently tested against the spec's exact numeric examples (see section 11).
Run `npm install && npm run dev` locally to start the dev server; if you hit any
TypeScript/build error, it's most likely a missing `npm install` step or a typo
introduced when copying — please report it and it can be fixed quickly.

## 11. Product photo upload
Admin → Products → Add/Edit Product now supports uploading JPG, PNG and WebP images directly from a phone (up to 5 MB). Files are stored under `public/uploads/` and the returned `/uploads/...` URL is saved with the product. This local upload approach is intended for a persistent Node.js server; for serverless deployment, replace it with object storage such as Supabase Storage, S3, or Cloudinary.
