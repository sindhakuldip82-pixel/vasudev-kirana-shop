import { NextResponse } from 'next/server';
import { isAdminAuthed } from '@/lib/auth';
import { getPushConfigStatus, listPushSubscriptions } from '@/lib/notifications';

export const dynamic = 'force-dynamic';

export async function GET() {
  if (!isAdminAuthed()) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const config = getPushConfigStatus();
  const subscriptions = await listPushSubscriptions();

  return NextResponse.json({ config, subscriptions, subscriptionCount: subscriptions.length });
}
