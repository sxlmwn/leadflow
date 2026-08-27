'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Plus,
  Globe,
  Layers,
  ArrowRight,
  RefreshCw
} from 'lucide-react';
import { AdminLayout } from '@/components/layout/AdminLayout';
import { supabase } from '@/lib/supabase';
import { AdminBrand, MOCK_BRANDS } from '@/lib/data';

export default function BrandsPage() {
  const [brands, setBrands] = useState<AdminBrand[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchBrands = async () => {
    setLoading(true);
    try {
      const { data } = await supabase.from('brands').select('*');
      if (data && data.length > 0) {
        setBrands(data);
      } else {
        setBrands(MOCK_BRANDS);
      }
    } catch (err) {
      console.error('Brands load error:', err);
      setBrands(MOCK_BRANDS);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBrands();
  }, []);

  const toggleBrandActive = async (id: string, currentStatus: boolean) => {
    setBrands(brands.map((b) => (b.id === id ? { ...b, is_active: !currentStatus } : b)));
    try {
      await supabase.from('brands').update({ is_active: !currentStatus }).eq('id', id);
    } catch (err) {
      console.error('Failed to toggle brand status:', err);
    }
  };

  return (
    <AdminLayout title="Brand Management">
      {/* Top Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight font-heading">
            Brand Funnels &amp; Vertical Assets
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-0.5">
            Configure visual themes, custom domain bindings, and form step schemas
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchBrands}
            className="flex items-center gap-2 px-3.5 py-2 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-200 shadow-2xs transition-all cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-blue-600 dark:text-blue-400' : 'text-slate-400'}`} />
            <span>Sync Brands</span>
          </button>
          <button className="flex items-center gap-2 px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold shadow-md shadow-blue-500/20 transition-all cursor-pointer">
            <Plus className="w-3.5 h-3.5" />
            <span>Create New Brand</span>
          </button>
        </div>
      </div>

      {/* Grid of Brand Cards (Responsive 1 column -> 2 cols -> 3 cols -> 4 cols on 1920px) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-6">
        {brands.map((brand) => {
          const primaryColor = brand.theme_config?.primary_color || '#2563eb';
          const fieldsCount = brand.form_schema?.fields?.length || 6;

          return (
            <div
              key={brand.id}
              className="admin-card p-6 flex flex-col justify-between hover:border-blue-300 dark:hover:border-blue-600 transition-all group"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-4 h-9 rounded-full shadow-2xs"
                      style={{ backgroundColor: primaryColor }}
                      title={`Primary Theme Color: ${primaryColor}`}
                    />
                    <div>
                      <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors font-heading">
                        {brand.name}
                      </h3>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                        {brand.vertical.replace(/_/g, ' ')}
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={() => toggleBrandActive(brand.id, brand.is_active)}
                    className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold transition-all cursor-pointer ${
                      brand.is_active
                        ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-700'
                    }`}
                  >
                    <span
                      className={`w-2 h-2 rounded-full ${
                        brand.is_active ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'
                      }`}
                    />
                    <span>{brand.is_active ? 'Active' : 'Paused'}</span>
                  </button>
                </div>

                <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-2 mb-5 italic bg-slate-50 dark:bg-slate-800/60 p-3 rounded-xl border border-slate-100 dark:border-slate-800">
                  &quot;{brand.theme_config?.headline || 'High converting lead funnel'}&quot;
                </p>

                <div className="space-y-2 text-xs mb-6">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400 flex items-center gap-1.5">
                      <Globe className="w-3.5 h-3.5 text-slate-400" />
                      Domain:
                    </span>
                    <span className="font-mono font-bold text-slate-800 dark:text-slate-200">{brand.domain}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400 flex items-center gap-1.5">
                      <Layers className="w-3.5 h-3.5 text-slate-400" />
                      Form Fields:
                    </span>
                    <span className="font-bold text-slate-800 dark:text-slate-200">{fieldsCount} Fields</span>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <Link
                  href={`/brands/${brand.id}`}
                  className="w-full py-2.5 px-4 bg-slate-50 dark:bg-slate-800 hover:bg-blue-50 dark:hover:bg-blue-950/60 hover:text-blue-700 dark:hover:text-blue-300 text-slate-700 dark:text-slate-200 font-bold rounded-xl text-xs flex items-center justify-center gap-2 border border-slate-200 dark:border-slate-700 hover:border-blue-200 dark:hover:border-blue-800 transition-all"
                >
                  <span>Edit Form &amp; Theme</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          );
        })}
      </div>
    </AdminLayout>
  );
}
