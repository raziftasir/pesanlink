'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { supabaseBrowser } from '@/lib/supabase-browser';

export default function AuthCallback() {
  const router = useRouter();
  const search = useSearchParams();
  const [msg, setMsg] = useState('Finishing sign-in…');

  useEffect(() => {
    const supabase = supabaseBrowser();

    async function run() {
      try {
        // 1) New flow: ?code=...
        const code = search.get('code');
        if (code) {
          const { error } = await supabase.auth.exchangeCodeForSession(code);
          if (error) throw error;
          router.replace('/dashboard');
          return;
        }

        // 2) Old flow: #access_token=...&refresh_token=...
        const hash = window.location.hash.startsWith('#')
          ? window.location.hash.slice(1)
          : '';
        const parts = new URLSearchParams(hash);
        const access_token = parts.get('access_token');
        const refresh_token = parts.get('refresh_token');

        if (access_token && refresh_token) {
          const { error } = await supabase.auth.setSession({
            access_token,
            refresh_token,
          });
          if (error) throw error;
          router.replace('/dashboard');
          return;
        }

        setMsg('Missing auth parameters. Please request a new link.');
      } catch (err) {
        setMsg(err instanceof Error ? err.message : 'Unable to complete sign-in.');
      }
    }

    run();
  }, [router, search]);

  return (
    <div className="min-h-[60vh] grid place-items-center text-center">
      <div>
        <h1 className="text-2xl font-semibold mb-2">PesanLink</h1>
        <p className="opacity-80">{msg}</p>
      </div>
    </div>
  );
}
