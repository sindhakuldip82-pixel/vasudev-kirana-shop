import { NextRequest, NextResponse } from 'next/server';
import { readData, writeData } from '@/lib/db';
import { isAdminAuthed } from '@/lib/auth';

export async function GET() {
  const data = await readData();
  return NextResponse.json({
    deliverySettings: data.deliverySettings,
    shopSettings: data.shopSettings,
  });
}

export async function PUT(req: NextRequest) {
  if (!isAdminAuthed()) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const body = await req.json();
  const data = await readData();
  if (body.deliverySettings) {
    data.deliverySettings = { ...data.deliverySettings, ...body.deliverySettings };
  }
  if (body.shopSettings) {
    data.shopSettings = { ...data.shopSettings, ...body.shopSettings };
  }
  await writeData(data);
  return NextResponse.json({
    deliverySettings: data.deliverySettings,
    shopSettings: data.shopSettings,
  });
}
