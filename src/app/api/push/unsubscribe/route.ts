import { NextRequest, NextResponse } from 'next/server';
import { isAdminAuthed } from '@/lib/auth';
import { removePushSubscription } from '@/lib/notifications';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  if (!isAdminAuthed()) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const body = await req.json().catch(() => ({}));
    const endpoint = body?.endpoint;
    if (!endpoint || typeof endpoint !== 'string') {
      return NextResponse.json({ error: 'endpoint is required' }, { status: 400 });
    }
    const removed = await removePushSubscription(endpoint);
    return NextResponse.json({ ok: true, removed });
  } catch (error) {
    console.error('Push unsubscribe failed:', error);
    return NextResponse.json({ error: 'Could not remove subscription.' }, { status: 500 });
  }
}
