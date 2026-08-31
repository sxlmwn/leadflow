'use client';

import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase/client';

interface BrandOption {
  slug: string;
  name: string;
  color: string;
}

export default function DevBrandSwitcher({ currentSlug }: { currentSlug?: string }) {
  if (process.env.NODE_ENV === 'production') return null;

  const searchParams = useSearchParams();
  const router = useRouter();
  const [brands, setBrands] = useState<BrandOption[]>([]);

  useEffect(() => {
    async function fetchActiveBrands() {
      try {
        const { data, error } = await supabase
          .from('brands')
          .select('slug, name, theme_config, is_active')
          .eq('is_active', true)
          .order('created_at', { ascending: true });

        if (data && data.length > 0) {
          const dynamicBrands: BrandOption[] = data.map((b: any) => ({
            slug: b.slug,
            name: b.name,
            color: b.theme_config?.primary_color || '#2563eb',
          }));
          setBrands(dynamicBrands);
        }
      } catch (err) {
        console.error('Failed to fetch dynamic brands for dev switcher:', err);
      }
    }

    fetchActiveBrands();
  }, []);

  const switchBrand = (slug: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('brand', slug);
    router.push(`/?${params.toString()}`);
  };

  return (
    <div className="w-full bg-slate-900 text-slate-200 py-2.5 px-4 text-xs font-mono shadow-md border-b border-slate-800">
      <div className="max-w-6xl mx-auto flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
          <span className="font-semibold text-slate-400">DEV BRAND OVERRIDE:</span>
          <span className="bg-slate-800 px-2 py-0.5 rounded text-amber-300 font-bold">
            {currentSlug || 'None (Domain Mode)'}
          </span>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-slate-400 font-medium mr-1">Switch Brand:</span>
          {brands.map((b) => (
            <button
              key={b.slug}
              onClick={() => switchBrand(b.slug)}
              className={`px-3 py-1 rounded-md text-xs font-sans font-semibold transition-all flex items-center gap-1.5 cursor-pointer ${
                currentSlug === b.slug
                  ? 'bg-slate-100 text-slate-900 shadow-sm ring-2 ring-amber-400 font-bold scale-105'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white'
              }`}
            >
              <span
                className="w-2.5 h-2.5 rounded-full inline-block"
                style={{ backgroundColor: b.color }}
              />
              {b.name}
            </button>
          ))}
          <button
            onClick={() => switchBrand('invalid-brand')}
            className={`px-2.5 py-1 rounded-md text-xs font-sans transition-all cursor-pointer ${
              currentSlug === 'invalid-brand'
                ? 'bg-red-500 text-white font-bold'
                : 'bg-slate-800 text-slate-400 hover:bg-red-900/50 hover:text-red-200'
            }`}
            title="Test invalid brand fallback state"
          >
            Test 404 Fallback
          </button>
        </div>
      </div>
    </div>
  );
}
