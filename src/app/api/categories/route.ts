import { NextRequest, NextResponse } from 'next/server';
import { readData, writeData } from '@/lib/db';
import { generateId } from '@/lib/id';
import { isAdminAuthed } from '@/lib/auth';
import { Category } from '@/types';

export async function GET() {
  const data = await readData();
  return NextResponse.json({ categories: data.categories.sort((a, b) => a.sortOrder - b.sortOrder) });
}

export async function POST(req: NextRequest) {
  if (!isAdminAuthed()) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const body = await req.json();
  const data = await readData();
  const newCategory: Category = {
    id: generateId('cat-'),
    name: body.name,
    gujaratiName: body.gujaratiName || '',
    slug: (body.slug || body.name || '').toLowerCase().replace(/\s+/g, '-'),
    icon: body.icon || '🛒',
    sortOrder: body.sortOrder ?? data.categories.length + 1,
    isActive: body.isActive ?? true,
  };
  data.categories.push(newCategory);
  await writeData(data);
  return NextResponse.json({ category: newCategory }, { status: 201 });
}
