'use client';

import { useState } from 'react';
import { createBrowserClient } from '@supabase/ssr';

export default function CampaignForm() {
  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [message, setMessage] = useState('');
  const [status, setStatus] = useState<'idle' | 'saving' | 'done' | 'error'>('idle');

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  async function onCreate(e: React.FormEvent) {
    e.preventDefault();
    setStatus('saving');
    try {
      // get current user id
      const { data: { user }, error: uerr } = await supabase.auth.getUser();
      if (uerr || !user) throw new Error('Please sign in first.');

      // basic slug cleanup
      const cleanSlug = slug.trim().toLowerCase().replace(/[^a-z0-9-_]/g, '-');

      const { error } = await supabase
        .from('campaigns')
        .insert({
          user_id: user.id,
          title: title.trim(),
          slug: cleanSlug,
          message: message.trim(),
        });

      if (error) throw error;
      setStatus('done');
      setTitle('');
      setSlug('');
      setMessage('');
    } catch (err) {
      console.error(err);
      setStatus('error');
    }
  }

  return (
    <form onSubmit={onCreate} className="grid gap-3 max-w-lg mx-auto text-left">
      <label className="grid gap-1">
        <span className="text-sm opacity-80">Title</span>
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="rounded border border-zinc-600 bg-transparent px-3 py-2 outline-none"
          placeholder="September WhatsApp Promo"
          required
        />
      </label>

      <label className="grid gap-1">
        <span className="text-sm opacity-80">Slug (short link)</span>
        <input
          value={slug}
          onChange={(e) => setSlug(e.target.value)}
          className="rounded border border-zinc-600 bg-transparent px-3 py-2 outline-none"
          placeholder="sept-promo"
          required
        />
        <small className="opacity-60">Your link will be: <code>{typeof window !== 'undefined' ? window.location.origin : ''}/{slug || 'your-slug'}</code></small>
      </label>

      <label className="grid gap-1">
        <span className="text-sm opacity-80">WhatsApp message</span>
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          className="rounded border border-zinc-600 bg-transparent px-3 py-2 outline-none min-h-[120px]"
          placeholder="Hi! I’m interested in your product…"
          required
        />
      </label>

      <button
        type="submit"
        disabled={status === 'saving'}
        className="rounded border border-zinc-600 px-3 py-2"
      >
        {status === 'saving' ? 'Saving…' : 'Create Campaign'}
      </button>

      {status === 'done' && (
        <p className="text-sm text-green-400">Saved. See it in the list below.</p>
      )}
      {status === 'error' && (
        <p className="text-sm text-red-400">Failed to save. Try a different slug.</p>
      )}
    </form>
  );
}
