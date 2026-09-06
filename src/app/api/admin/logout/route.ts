import { NextResponse } from 'next/server';
import { getAdminSessionCookieName } from '@/lib/auth';

export async function POST() {
  const res = NextResponse.json({ success: true });
  res.cookies.set(getAdminSessionCookieName(), '', { maxAge: 0, path: '/' });
  return res;
}
