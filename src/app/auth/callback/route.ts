import { NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase-server';

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  if (!code) return NextResponse.redirect(`${origin}/?error=missing_code`);

  const supabase = supabaseServer();
  const { error } = await supabase.auth.exchangeCodeForSession(code);
  if (error) return NextResponse.redirect(`${origin}/?error=${encodeURIComponent(error.message)}`);

  return NextResponse.redirect(`${origin}/dashboard`);
}
