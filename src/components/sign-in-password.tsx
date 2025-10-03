"use client";

import { useState } from "react";
import { createBrowserClient } from "@supabase/ssr";

export default function SignInForm() {
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [msg, setMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setMsg(null);

    const action =
      mode === "signin"
        ? supabase.auth.signInWithPassword({ email, password })
        : supabase.auth.signUp({ email, password });

    const { error } = await action;
    setLoading(false);

    if (error) {
      setMsg(error.message);
      return;
    }

    // Success: reload to let server read the session cookie
    window.location.assign("/dashboard");
  }

  async function sendReset() {
    setLoading(true);
    setMsg(null);

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/update-password`,
    });

    setLoading(false);
    setMsg(error ? error.message : "Check your email for the reset link.");
  }

  return (
    <div className="w-[min(420px,calc(100vw-2rem))]">
      <form onSubmit={handleSubmit} className="grid gap-3">
        <input
          type="email"
          placeholder="you@email.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="rounded border border-white/20 bg-transparent px-3 py-2"
          required
        />

        <input
          type="password"
          placeholder="Your password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="rounded border border-white/20 bg-transparent px-3 py-2"
          required
        />

        <button
          type="submit"
          disabled={loading}
          className="rounded border border-white/40 px-3 py-2"
        >
          {loading ? "Please wait…" : mode === "signin" ? "Sign in" : "Create account"}
        </button>

        <div className="flex items-center justify-between text-sm">
          <button
            type="button"
            onClick={() => setMode(mode === "signin" ? "signup" : "signin")}
            className="underline opacity-80"
          >
            {mode === "signin" ? "Create an account" : "Have an account? Sign in"}
          </button>

          <button
            type="button"
            onClick={sendReset}
            className="underline opacity-80"
            disabled={!email || loading}
            title={!email ? "Enter your email first" : ""}
          >
            Forgot password?
          </button>
        </div>

        {msg && <p className="text-sm opacity-80">{msg}</p>}
      </form>
    </div>
  );
}
