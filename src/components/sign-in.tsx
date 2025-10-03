// src/components/sign-in.tsx
'use client';

import { useState } from 'react';
import { createBrowserClient } from '@supabase/ssr';

export default function SignInForm() {
  const [email, setEmail] = useState('');
  const [status, setStatus] =
    useState<'idle' | 'sending' | 'sent' | 'error'>('idle');

  // Browser client for client-side auth calls
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus('sending');
    try {
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      });
      if (error) throw error;
      setStatus('sent');
    } catch (err) {
      console.error(err);
      setStatus('error');
    }
  }

  return (
    <form onSubmit={onSubmit} className="flex flex-col items-center gap-3 w-[320px]">
      <input
        type="email"
        required
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="you@email.com"
        className="w-full rounded bg-transparent border border-zinc-600 px-3 py-2"
      />
      <button
        disabled={status === 'sending'}
        className="w-full rounded border border-zinc-600 px-3 py-2"
      >
        {status === 'sending' ? 'Sending…' : 'Sign in with Email Link'}
      </button>

      {status === 'sent' && (
        <p className="text-sm opacity-70">Check your inbox for the magic link.</p>
      )}
      {status === 'error' && (
        <p className="text-sm text-red-400">Failed to send link.</p>
      )}
    </form>
  );
}
