import SignInForm from "@/components/sign-in-password";
import { cookies } from "next/headers";
import { createServerClient, type CookieOptions } from "@supabase/ssr";

export const revalidate = 0; // always fresh in dev

export default async function Page() {
  // Server-aware Supabase client (no awaiting cookies())
  const cookieStore = cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
        set(_name: string, _value: string, _options: CookieOptions) {
          /* no-op in Server Component */
        },
        remove(_name: string, _options: CookieOptions) {
          /* no-op in Server Component */
        },
      },
    }
  );

  const { data } = await supabase.auth.getUser();
  const user = data.user;

  return (
    <main className="min-h-[70vh] grid place-items-center text-center">
      {user ? (
        <div className="flex flex-col items-center gap-4">
          <h1 className="text-2xl font-semibold">PesanLink 🚀</h1>
          <p className="opacity-70">Signed in as {user.email}</p>

          {/* posts to your existing /auth/signout route */}
          <form action="/auth/signout" method="post">
            <button className="rounded border border-white/40 px-3 py-2">Sign out</button>
          </form>

          <a href="/dashboard" className="underline">Go to dashboard →</a>
        </div>
      ) : (
        <div className="flex flex-col items-center gap-6">
          <div>
            <h1 className="text-2xl font-semibold">PesanLink 🚀</h1>
            <p className="opacity-70 mt-2">Turn WhatsApp into a storefront</p>
          </div>

          {/* Password sign-in form (client component) */}
          <SignInForm />
        </div>
      )}
    </main>
  );
}
