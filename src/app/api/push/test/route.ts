import { NextRequest, NextResponse } from 'next/server';
import { isAdminAuthed } from '@/lib/auth';
import { sendTestNotification } from '@/lib/notifications';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  if (!isAdminAuthed()) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const body = await req.json().catch(() => ({}));
    const result = await sendTestNotification(typeof body?.endpoint === 'string' ? body.endpoint : undefined);

    if (result.reason === 'not_configured') {
      return NextResponse.json(
        { error: 'VAPID keys are not configured on the server yet.' },
        { status: 400 },
      );
    }
    if (result.reason === 'no_subscribers') {
      return NextResponse.json(
        { error: 'No push subscription found for this device. Enable alerts first.' },
        { status: 400 },
      );
    }

    return NextResponse.json({ ok: true, sent: result.sent, removed: result.removed });
  } catch (error) {
    console.error('Test notification failed:', error);
    return NextResponse.json({ error: 'Could not send test notification.' }, { status: 500 });
  }
}
