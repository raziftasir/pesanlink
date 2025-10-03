import Link from "next/link";
import { cookies } from "next/headers";
import { createServerClient, type CookieOptions } from "@supabase/ssr";

export default async function Nav() {
  // server-aware supabase client (read-only cookies here)
  const cookieStore = cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
        set(_n: string, _v: string, _o?: CookieOptions) {},
        remove(_n: string, _o?: CookieOptions) {},
      },
    }
  );

  const { data } = await supabase.auth.getUser();
  const user = data.user;

  return (
    <header className="w-full border-b border-white/10">
      <nav className="mx-auto flex max-w-4xl items-center justify-between px-4 py-3">
        <Link href="/" className="font-semibold">PesanLink</Link>

        <div className="flex items-center gap-3">
          <Link href="/" className="rounded border border-white/20 px-2 py-1 text-sm">Home</Link>
          <Link href="/docs" className="rounded border border-white/20 px-2 py-1 text-sm">Docs</Link>
          <Link href="/pricing" className="rounded border border-white/20 px-2 py-1 text-sm">Pricing</Link>

          {user ? (
            <>
              <Link href="/dashboard" className="rounded border border-white/20 px-2 py-1 text-sm">
                Dashboard
              </Link>
              <form action="/auth/signout" method="post">
                <button className="rounded border border-white/40 px-2 py-1 text-sm">
                  Sign out
                </button>
              </form>
            </>
          ) : (
            <a href="#signin" className="rounded border border-white/40 px-2 py-1 text-sm">
              Sign in
            </a>
          )}
        </div>
      </nav>
    </header>
  );
}
