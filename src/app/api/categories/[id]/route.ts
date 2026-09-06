import { NextRequest, NextResponse } from 'next/server';
import { readData, writeData } from '@/lib/db';
import { isAdminAuthed } from '@/lib/auth';

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  if (!isAdminAuthed()) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const body = await req.json();
  const data = await readData();
  const idx = data.categories.findIndex((c) => c.id === params.id);
  if (idx === -1) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  data.categories[idx] = { ...data.categories[idx], ...body, id: data.categories[idx].id };
  await writeData(data);
  return NextResponse.json({ category: data.categories[idx] });
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  if (!isAdminAuthed()) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const data = await readData();
  const inUse = data.products.some((p) => p.categoryId === params.id);
  if (inUse) {
    return NextResponse.json(
      { error: 'Cannot delete a category that still has products. Move or delete those products first.' },
      { status: 400 }
    );
  }
  const idx = data.categories.findIndex((c) => c.id === params.id);
  if (idx === -1) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  data.categories.splice(idx, 1);
  await writeData(data);
  return NextResponse.json({ success: true });
}
