import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createServerClient, type CookieOptions } from '@supabase/ssr';

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const code = url.searchParams.get('code');

  if (!code) {
    const desc = url.searchParams.get('error_description') ?? 'missing_code';
    return NextResponse.redirect(new URL(`/?error=${encodeURIComponent(desc)}`, req.url));
  }

  const cookieStore = cookies();

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions = {}) {
          cookieStore.set({ name, value, path: '/', ...options });
        },
        remove(name: string, options: CookieOptions = {}) {
          cookieStore.delete({ name, path: '/', ...options });
        },
      },
    }
  );

  await supabase.auth.exchangeCodeForSession(code);

  return NextResponse.redirect(new URL('/dashboard', req.url));
}
