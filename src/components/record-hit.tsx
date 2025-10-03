'use client';

import { useEffect } from 'react';

type Props = { id: string };

export default function RecordHit({ id }: Props) {
  useEffect(() => {
    // fire-and-forget; no UI updates needed
    fetch('/api/hit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ campaign_id: id, ua: navigator.userAgent }),
    }).catch(() => {});
  }, [id]);

  return null;
}
