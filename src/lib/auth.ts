import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-change-me';
const COOKIE_NAME = 'vks_admin_session';

export function verifyAdminCredentials(username: string, password: string): boolean {
  const envUser = process.env.ADMIN_USERNAME || 'admin';
  const envPass = process.env.ADMIN_PASSWORD || 'admin123';
  return username === envUser && password === envPass;
}

export function createAdminToken(username: string): string {
  return jwt.sign({ username, role: 'admin' }, JWT_SECRET, { expiresIn: '7d' });
}

export function verifyAdminToken(token: string | undefined): boolean {
  if (!token) return false;
  try {
    jwt.verify(token, JWT_SECRET);
    return true;
  } catch {
    return false;
  }
}

export function getAdminSessionCookieName(): string {
  return COOKIE_NAME;
}

/** Server-side helper: is the current request authenticated as admin? */
export function isAdminAuthed(): boolean {
  const store = cookies();
  const token = store.get(COOKIE_NAME)?.value;
  return verifyAdminToken(token);
}
