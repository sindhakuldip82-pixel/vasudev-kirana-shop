import { NextRequest, NextResponse } from 'next/server';
import { verifyAdminCredentials, createAdminToken, getAdminSessionCookieName } from '@/lib/auth';

export async function POST(req: NextRequest) {
  const { username, password } = await req.json();
  if (!verifyAdminCredentials(username, password)) {
    return NextResponse.json({ error: 'invalid_credentials' }, { status: 401 });
  }
  const token = createAdminToken(username);
  const res = NextResponse.json({ success: true });
  res.cookies.set(getAdminSessionCookieName(), token, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    maxAge: 60 * 60 * 24 * 7,
    path: '/',
  });
  return res;
}
