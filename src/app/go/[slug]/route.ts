import { redirect } from "next/navigation";
import { headers, cookies } from "next/headers";
import { createServerClient, type CookieOptions } from "@supabase/ssr";

/** Make sure this handler always runs on the server fresh */
export const dynamic = "force-dynamic";

/** Build a server-aware Supabase client (read-only cookies in route handlers) */
function getServerClient() {
  const cookieStore = cookies();
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        // read-only usage for route handlers
        get: (name: string) => cookieStore.get(name)?.value,
        // no-ops (we don't mutate cookies here)
        set: () => {},
        remove: () => {},
      },
    }
  );
}

/** GET /go/[slug] */
export async function GET(
  _req: Request,
  { params }: { params: { slug: string } }
) {
  const supabase = getServerClient();

  // 1) fetch the campaign by slug
  const { data: campaign, error } = await supabase
    .from("campaigns")
    .select("id, message")
    .eq("slug", params.slug)
    .maybeSingle();

  if (error || !campaign) {
    // invalid slug -> send home
    redirect("/");
  }

  // 2) record the hit (best effort)
  try {
    const ua = headers().get("user-agent") ?? null;
    await supabase.from("hits").insert({
      campaign_id: campaign.id,
      user_agent: ua,
    });
  } catch {
    // ignore failures — do not block redirect
  }

  // 3) redirect to WhatsApp
  const waHref = `https://wa.me/?text=${encodeURIComponent(campaign.message)}`;
  redirect(waHref);
}
