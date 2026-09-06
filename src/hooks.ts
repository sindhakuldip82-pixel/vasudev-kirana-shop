'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

/** Client-side guard: redirects to /admin/login if there is no valid admin session. */
export function useRequireAdmin() {
  const router = useRouter();
  const [checking, setChecking] = useState(true);
  const [authed, setAuthed] = useState(false);

  useEffect(() => {
    fetch('/api/admin/me')
      .then((r) => r.json())
      .then((d) => {
        setAuthed(!!d.authed);
        if (!d.authed) router.replace('/admin/login');
      })
      .catch(() => router.replace('/admin/login'))
      .finally(() => setChecking(false));
  }, [router]);

  return { checking, authed };
}
