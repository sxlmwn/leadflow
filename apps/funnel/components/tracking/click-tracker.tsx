'use client';

import { useEffect, useRef } from 'react';

export default function ClickTracker({ brandId }: { brandId: string }) {
  const trackedRef = useRef(false);

  useEffect(() => {
    if (trackedRef.current) return;
    trackedRef.current = true;

    // Check if lf_click_id cookie is already present
    const hasClickCookie = document.cookie
      .split('; ')
      .some((row) => row.startsWith('lf_click_id='));

    if (hasClickCookie) return;

    // Extract query parameters from URL
    const searchParams = new URLSearchParams(window.location.search);
    const queryParamsObj: Record<string, string> = {};
    searchParams.forEach((val, key) => {
      queryParamsObj[key] = val;
    });

    // Send non-blocking beacon to /api/clicks
    fetch('/api/clicks', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        brand_id: brandId,
        landing_url: window.location.href,
        query_params: queryParamsObj,
        referrer: document.referrer || null,
      }),
    }).catch((err) => {
      console.warn('Click tracker error:', err);
    });
  }, [brandId]);

  return null; // Invisible tracker component
}
