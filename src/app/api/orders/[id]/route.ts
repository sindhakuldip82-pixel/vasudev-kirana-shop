import { NextRequest, NextResponse } from 'next/server';
import { readData, writeData } from '@/lib/db';
import { isAdminAuthed } from '@/lib/auth';

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const data = await readData();
  const order = data.orders.find((o) => o.id === params.id);
  if (!order) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json({ order });
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  if (!isAdminAuthed()) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const body = await req.json();
  const data = await readData();
  const idx = data.orders.findIndex((o) => o.id === params.id);
  if (idx === -1) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  data.orders[idx] = { ...data.orders[idx], status: body.status, updatedAt: new Date().toISOString() };
  await writeData(data);
  return NextResponse.json({ order: data.orders[idx] });
}
