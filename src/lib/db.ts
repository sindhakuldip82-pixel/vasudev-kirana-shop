import fs from 'fs';
import path from 'path';
import { get, put } from '@vercel/blob';
import { AppData } from '@/types';

const DB_PATH = path.join(process.cwd(), 'data', 'db.json');
const BLOB_PATH = 'app-data/db.json';
const DB_STORE_ID = process.env.DATA_STORE_ID;

function useBlobStorage() {
  return process.env.VERCEL === '1' || !!DB_STORE_ID;
}

function readLocalData(): AppData {
  const raw = fs.readFileSync(DB_PATH, 'utf-8');
  return JSON.parse(raw) as AppData;
}

async function readBlobData(): Promise<AppData> {
  if (!DB_STORE_ID) {
    throw new Error('DATA_STORE_ID is not configured');
  }

  try {
    const result = await get(BLOB_PATH, {
      access: 'private',
      storeId: DB_STORE_ID,
      useCache: false,
    });

    if (!result) throw new Error('Blob database not found');

    const raw = await new Response(result.stream).text();
    return JSON.parse(raw) as AppData;
  } catch {
    const initial = readLocalData();

    await put(BLOB_PATH, JSON.stringify(initial, null, 2), {
      access: 'private',
      storeId: DB_STORE_ID,
      addRandomSuffix: false,
      allowOverwrite: true,
      contentType: 'application/json',
    });

    return initial;
  }
}

export async function readData(): Promise<AppData> {
  if (useBlobStorage()) return readBlobData();
  return readLocalData();
}

export async function writeData(data: AppData): Promise<void> {
  if (!useBlobStorage()) {
    fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2), 'utf-8');
    return;
  }

  await put(BLOB_PATH, JSON.stringify(data, null, 2), {
    access: 'private',
    storeId: DB_STORE_ID,
    addRandomSuffix: false,
    allowOverwrite: true,
    contentType: 'application/json',
  });
}

export function nextOrderNumber(data: AppData): string {
  const max = data.orders.reduce((highest, order) => {
    const match = /^VKS-(\d+)$/.exec(order.orderNumber || '');
    return match ? Math.max(highest, Number(match[1])) : highest;
  }, 0);

  return `VKS-${String(max + 1).padStart(6, '0')}`;
}
