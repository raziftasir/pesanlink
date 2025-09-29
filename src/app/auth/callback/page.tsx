'use client';

import { Suspense } from 'react';
import CallbackInner from './callback-inner';

// disable prerender / SSG for this page
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default function AuthCallbackPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-[60vh] grid place-items-center text-center">
          <p>Finishing sign-in…</p>
        </div>
      }
    >
      <CallbackInner />
    </Suspense>
  );
}
