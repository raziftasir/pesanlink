'use client';

import { useState } from 'react';
import { supabaseBrowser } from '@/lib/supabase-browser';

export default function Home() {
  const [email, setEmail] = useState('');
  const [ok, setOk] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSignIn(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true); setOk(null); setErr(null);
    try {
      const supabase = supabaseBrowser();
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: { emailRedirectTo: `${window.location.origin}/auth/callback` },
      });
      if (error) throw error;
      setOk('Check your email for the login link.');
    } catch (e: any) {
      setErr(e.message || 'Failed to send magic link');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-[60vh] grid place-items-center text-center">
      <div className="max-w-md w-full">
        <h1 className="text-4xl font-bold mb-2">PesanLink 🚀</h1>
        <p className="opacity-80 mb-6">Turn WhatsApp into a storefront</p>

        <form onSubmit={onSignIn} className="space-y-3">
          <input
            type="email"
            required
            placeholder="you@email.com"
            value={email}
            onChange={(e)=>setEmail(e.target.value)}
            className="w-full px-3 py-2 rounded-lg bg-transparent border"
          />
          <button disabled={loading} className="w-full px-4 py-2 rounded-lg border">
            {loading ? 'Sending…' : 'Sign in with Email Link'}
          </button>
        </form>

        {ok && <p className="mt-3 text-green-400">{ok}</p>}
        {err && <p className="mt-3 text-red-400">{err}</p>}
      </div>
    </div>
  );
}
