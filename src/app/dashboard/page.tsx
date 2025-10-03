import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { createServerClient, type CookieOptions } from "@supabase/ssr";

/* ---------------- Server-aware Supabase client --------------- */
function getServerClient() {
  const cookieStore = cookies(); // do NOT await in Server Component pages

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get: (name: string) => cookieStore.get(name)?.value,
        set: (_name: string, _value: string, _options: CookieOptions) => {
          /* no-op in Server Component page */
        },
        remove: (_name: string, _options: CookieOptions) => {
          /* no-op in Server Component page */
        },
      },
    }
  );

  return supabase;
}

/* ---------------- Small helpers --------------- */
function slugify(input: string) {
  return input
    .toLowerCase()
    .trim()
    .replace(/[\s_]+/g, "-")
    .replace(/[^\w-]+/g, "");
}

/* ---------------- Server Actions --------------- */
export async function createCampaign(formData: FormData) {
  "use server";
  const supabase = getServerClient();

  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) redirect("/");

  const title = String(formData.get("title") || "").trim();
  const message = String(formData.get("message") || "").trim();

  if (!title || !message) {
    // Re-render dashboard so the form shows again
    return redirect("/dashboard");
  }

  // unique slug generation
  const base = slugify(title) || "campaign";
  let candidate = base;

  for (let i = 0; i < 5; i++) {
    const { data: exists } = await supabase
      .from("campaigns")
      .select("id")
      .eq("slug", candidate)
      .maybeSingle();

    if (!exists) break;
    candidate = `${base}-${Math.random().toString(36).slice(2, 6)}`;
  }

  await supabase.from("campaigns").insert({
    user_id: auth.user.id,
    slug: candidate,
    title,
    message,
  });

  redirect("/dashboard");
}

export async function updateCampaign(formData: FormData) {
  "use server";
  const supabase = getServerClient();

  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) redirect("/");

  const id = String(formData.get("id") || "");
  const title = String(formData.get("title") || "").trim();
  const message = String(formData.get("message") || "").trim();

  if (!id || !title || !message) return redirect("/dashboard");

  // Optional: regenerate slug if title changed
  const newSlug = slugify(title);
  let slug = newSlug;

  if (slug) {
    const { data: existing } = await supabase
      .from("campaigns")
      .select("id")
      .eq("slug", slug)
      .neq("id", id)
      .maybeSingle();

    if (existing) {
      slug = `${newSlug}-${Math.random().toString(36).slice(2, 6)}`;
    }
  }

  await supabase
    .from("campaigns")
    .update({ title, message, slug })
    .eq("id", id);

  redirect("/dashboard");
}

export async function deleteCampaign(formData: FormData) {
  "use server";
  const supabase = getServerClient();

  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) redirect("/");

  const id = String(formData.get("id") || "");
  if (id) await supabase.from("campaigns").delete().eq("id", id);

  redirect("/dashboard");
}

/* ---------------- Page --------------- */
export const revalidate = 0; // always fresh in dev

type SearchParams = {
  searchParams: Promise<{ page?: string; limit?: string }>;
};

export default async function DashboardPage({ searchParams }: SearchParams) {
  const supabase = getServerClient();

  // Require auth
  const { data: auth } = await supabase.auth.getUser();
  const user = auth.user;
  if (!user) redirect("/");

  // Read search params (in Next 15 these may be Promises)
  const sp = await searchParams;
  const page = Math.max(1, Number(sp.page ?? 1));
  const limit = Math.max(1, Math.min(50, Number(sp.limit ?? 10)));
  const from = (page - 1) * limit;
  const to = from + limit - 1;

  /* ---- fetch total count for this user ---- */
  const { count: total } = await supabase
    .from("campaigns")
    .select("*", { count: "exact", head: true })
    .eq("user_id", user.id);

  /* ---- fetch page rows ---- */
  const { data: campaigns, error } = await supabase
    .from("campaigns")
    .select("id, slug, title, message, created_at")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .range(from, to);

  if (error) {
    return (
      <main className="mx-auto max-w-3xl px-6 py-10">
        <h1 className="text-3xl font-semibold mb-4">Dashboard</h1>
        <p className="opacity-70">Failed to load campaigns: {error.message}</p>
      </main>
    );
  }

  /* ---- build hit counts (simple tally from hits table) ---- */
  const hitCounts: Record<string, number> = {};
  if (campaigns && campaigns.length > 0) {
    const ids = campaigns.map((c) => c.id);
    const { data: hitRows } = await supabase
      .from("hits")
      .select("campaign_id")
      .in("campaign_id", ids);

    if (hitRows) {
      for (const row of hitRows) {
        const k = row.campaign_id as string;
        hitCounts[k] = (hitCounts[k] || 0) + 1;
      }
    }
  }

  const totalPages = total ? Math.max(1, Math.ceil(total / limit)) : 1;

  return (
    <main className="mx-auto max-w-3xl px-6 py-10">
      <h1 className="text-3xl font-semibold mb-2">Dashboard</h1>
      <p className="opacity-80 mb-6">Signed in as {user.email}</p>

      {/* Create */}
      <section className="rounded-lg border border-zinc-700 p-4 mb-8">
        <h2 className="text-lg font-medium mb-3">Create a campaign</h2>
        <form action={createCampaign} className="grid gap-3">
          <input
            name="title"
            placeholder="Title"
            className="rounded border border-white/20 bg-transparent px-3 py-2"
            required
          />
          <textarea
            name="message"
            placeholder="WhatsApp message"
            className="rounded border border-white/20 bg-transparent px-3 py-2 min-h-[120px]"
            required
          />
          <button className="justify-self-start rounded border border-white/40 px-3 py-2">
            Save
          </button>
        </form>
      </section>

      {/* List */}
      <section className="grid gap-3">
        <h2 className="text-lg font-medium mb-2">Your campaigns</h2>

        {(!campaigns || campaigns.length === 0) && (
          <p className="opacity-70">No campaigns yet.</p>
        )}

        {campaigns?.map((c) => (
          <div
            key={c.id}
            className="rounded border border-white/20 p-3 grid gap-2"
          >
            <div className="flex items-center justify-between gap-3">
              <div className="font-medium">{c.title}</div>
              <div className="text-sm">
                Hits: <span className="opacity-80">{hitCounts[c.id] ?? 0}</span>
              </div>
            </div>

            <p className="opacity-80 text-sm">{c.message}</p>

            <div className="text-sm">
              Public:{" "}
              <a className="underline" href={`/go/${c.slug}`} target="_blank">
                /go/{c.slug}
              </a>
            </div>

            {/* Delete */}
            <form action={deleteCampaign}>
              <input type="hidden" name="id" value={c.id} />
              <button className="rounded border border-white/40 px-3 py-1 text-sm">
                Delete
              </button>
            </form>

            {/* Inline edit */}
            <details>
              <summary className="cursor-pointer text-sm opacity-80">
                Edit
              </summary>
              <form action={updateCampaign} className="mt-2 grid gap-2">
                <input type="hidden" name="id" value={c.id} />
                <input
                  name="title"
                  defaultValue={c.title}
                  className="rounded border border-white/20 bg-transparent px-3 py-2"
                  required
                />
                <textarea
                  name="message"
                  defaultValue={c.message}
                  className="rounded border border-white/20 bg-transparent px-3 py-2 min-h-[100px]"
                  required
                />
                <button className="justify-self-start rounded border border-white/40 px-3 py-1 text-sm">
                  Update
                </button>
              </form>
            </details>
          </div>
        ))}
      </section>

      {/* Pagination */}
      {totalPages > 1 && (
        <nav className="mt-8 flex items-center gap-2">
          {Array.from({ length: totalPages }).map((_, i) => {
            const n = i + 1;
            const href = `/dashboard?page=${n}&limit=${limit}`;
            const active = n === page;
            return (
              <a
                key={n}
                href={href}
                className={`rounded border px-3 py-1 text-sm ${
                  active ? "border-white/70" : "border-white/20 opacity-80"
                }`}
              >
                {n}
              </a>
            );
          })}
        </nav>
      )}

      {/* Sign out */}
      <form action="/auth/signout" method="post" className="mt-10">
        <button className="rounded border border-white/40 px-3 py-2">
          Sign out
        </button>
      </form>
    </main>
  );
}
