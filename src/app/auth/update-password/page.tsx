"use client";

import { useState } from "react";
import { createBrowserClient } from "@supabase/ssr";

export default function UpdatePasswordPage() {
  const [password, setPassword] = useState("");
  const [msg, setMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  async function handleUpdate(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setMsg(null);

    const { error } = await supabase.auth.updateUser({ password });

    setLoading(false);
    if (error) {
      setMsg(error.message);
      return;
    }

    // Password updated—send the user to the app
    window.location.assign("/dashboard");
  }

  return (
    <main className="min-h-[70vh] grid place-items-center">
      <form onSubmit={handleUpdate} className="grid gap-3 w-[min(420px,calc(100vw-2rem))]">
        <h1 className="text-xl font-semibold">Set a new password</h1>
        <input
          type="password"
          placeholder="New password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="rounded border border-white/20 bg-transparent px-3 py-2"
          minLength={6}
          required
        />
        <button
          type="submit"
          disabled={loading}
          className="rounded border border-white/40 px-3 py-2"
        >
          {loading ? "Updating…" : "Update password"}
        </button>
        {msg && <p className="text-sm text-red-400">{msg}</p>}
      </form>
    </main>
  );
}
