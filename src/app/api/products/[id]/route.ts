import { NextRequest, NextResponse } from 'next/server';
import { readData, writeData } from '@/lib/db';
import { isAdminAuthed } from '@/lib/auth';

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const data = readData();
  const product = data.products.find((p) => p.id === params.id || p.slug === params.id);
  if (!product) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json({ product });
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  if (!isAdminAuthed()) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const body = await req.json();
  const data = readData();
  const idx = data.products.findIndex((p) => p.id === params.id);
  if (idx === -1) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  data.products[idx] = {
    ...data.products[idx],
    ...body,
    id: data.products[idx].id,
    updatedAt: new Date().toISOString(),
  };
  writeData(data);
  return NextResponse.json({ product: data.products[idx] });
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  if (!isAdminAuthed()) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const data = readData();
  const idx = data.products.findIndex((p) => p.id === params.id);
  if (idx === -1) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  data.products.splice(idx, 1);
  writeData(data);
  return NextResponse.json({ success: true });
}
