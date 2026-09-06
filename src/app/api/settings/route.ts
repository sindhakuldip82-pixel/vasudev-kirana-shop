import { NextRequest, NextResponse } from 'next/server';
import { readData, writeData } from '@/lib/db';
import { isAdminAuthed } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const data = await readData();
    return NextResponse.json(
      {
        deliverySettings: data.deliverySettings,
        shopSettings: data.shopSettings,
      },
      { headers: { 'Cache-Control': 'no-store' } },
    );
  } catch (error) {
    console.error('Settings read failed', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Could not load settings.' },
      { status: 500, headers: { 'Cache-Control': 'no-store' } },
    );
  }
}

export async function PUT(req: NextRequest) {
  if (!isAdminAuthed()) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await req.json();
    const data = await readData();

    if (body.deliverySettings) {
      data.deliverySettings = { ...data.deliverySettings, ...body.deliverySettings };
    }
    if (body.shopSettings) {
      data.shopSettings = { ...data.shopSettings, ...body.shopSettings };
    }

    await writeData(data);

    return NextResponse.json(
      {
        deliverySettings: data.deliverySettings,
        shopSettings: data.shopSettings,
      },
      { headers: { 'Cache-Control': 'no-store' } },
    );
  } catch (error) {
    console.error('Settings save failed', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Could not save settings.' },
      { status: 500, headers: { 'Cache-Control': 'no-store' } },
    );
  }
}
