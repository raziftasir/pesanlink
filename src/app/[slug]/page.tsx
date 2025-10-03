import Link from 'next/link';
import { cookies } from 'next/headers';
import { createServerClient } from '@supabase/ssr';
import RecordHit from '@/components/record-hit';

export const revalidate = 0;

type Props = { params: { slug: string } };

function getServerClient() {
  const cookieStore = cookies();
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get: (name: string) => cookieStore.get(name)?.value,
        set: () => {},
        remove: () => {},
      },
    }
  );
}

export default async function CampaignPublicPage({ params }: Props) {
  const supabase = getServerClient();

  const { data, error } = await supabase
    .from('campaigns')
    .select('id, title, message')
    .eq('slug', params.slug)
    .maybeSingle();

  if (error || !data) {
    return (
      <main className="min-h-[70vh] grid place-items-center text-center px-6">
        <div>
          <h1 className="text-2xl font-semibold mb-2">Not found</h1>
          <p className="opacity-70 mb-6">This link doesn’t exist.</p>
          <div className="mt-6">
            <Link className="underline" href="/">Go home</Link>
          </div>
        </div>
      </main>
    );
  }

  // This is the redirect target that logs the hit (via RecordHit) before opening WhatsApp
  const goHref = `/go/${params.slug}`;

  return (
    <main className="min-h-[70vh] grid place-items-center text-center px-6">
      <div className="max-w-xl">
        <h1 className="text-2xl font-semibold mb-2">{data.title}</h1>
        <p className="opacity-80 whitespace-pre-wrap mb-6">{data.message}</p>

        <a
          href={goHref}
          className="inline-block rounded border border-white/40 px-4 py-2"
        >
          Open in WhatsApp
        </a>

        {/* Fire a hit when this page is rendered on the client */}
        {data.id && <RecordHit id={data.id} />}
      </div>
    </main>
  );
}
