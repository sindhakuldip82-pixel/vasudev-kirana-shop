import { NextRequest, NextResponse } from 'next/server';
import { isAdminAuthed } from '@/lib/auth';
import { savePushSubscription } from '@/lib/notifications';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  if (!isAdminAuthed()) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const subscription = await req.json();
    if (!subscription?.endpoint || !subscription?.keys?.p256dh || !subscription?.keys?.auth) {
      return NextResponse.json({ error: 'Invalid push subscription' }, { status: 400 });
    }
    await savePushSubscription(subscription);
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('Push subscription save failed:', error);
    return NextResponse.json({ error: 'Could not save notification subscription.' }, { status: 500 });
  }
}
