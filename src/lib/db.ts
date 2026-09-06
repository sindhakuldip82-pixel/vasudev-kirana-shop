import fs from 'fs';
import path from 'path';
import { AppData } from '@/types';

/**
 * Lightweight JSON-file "database".
 *
 * This is intentionally simple so the project runs with zero external
 * services out of the box. It is NOT suitable for serverless platforms
 * with a read-only filesystem (e.g. Vercel) in production, because writes
 * won't persist between requests there.
 *
 * ---- Upgrading to a real database later ----
 * The shape of AppData (see src/types/index.ts) maps directly onto tables:
 *   products, categories, orders, delivery_settings, shop_settings
 * To swap in Postgres/Supabase/PlanetScale/SQLite:
 *   1. Keep this file's exported function signatures the same
 *      (readData, writeData, or move to per-entity functions).
 *   2. Replace the fs.readFileSync/writeFileSync bodies with your ORM
 *      calls (e.g. Prisma, Drizzle, Supabase client).
 * Every API route in src/app/api/** only talks to the functions in this
 * file, so the rest of the app does not need to change.
 */

const DB_PATH = path.join(process.cwd(), 'data', 'db.json');

export function readData(): AppData {
  const raw = fs.readFileSync(DB_PATH, 'utf-8');
  return JSON.parse(raw) as AppData;
}

export function writeData(data: AppData): void {
  fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2), 'utf-8');
}

export function nextOrderNumber(data: AppData): string {
  const count = data.orders.length + 1;
  return `VKS-${String(count).padStart(6, '0')}`;
}
