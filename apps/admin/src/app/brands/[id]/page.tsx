'use client';

import React, { useEffect, useState, use } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Sliders, Palette, Layers, CheckCircle } from 'lucide-react';
import { AdminLayout } from '@/components/layout/AdminLayout';
import { FormBuilder } from '@/components/brands/FormBuilder';
import { ThemeEditor } from '@/components/brands/ThemeEditor';
import { supabase } from '@/lib/supabase';
import { AdminBrand, MOCK_BRANDS } from '@/lib/data';

export default function BrandDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const brandId = resolvedParams.id;
  const router = useRouter();

  const [brand, setBrand] = useState<AdminBrand | null>(null);
  const [activeTab, setActiveTab] = useState<'form' | 'theme'>('form');
  const [loading, setLoading] = useState(true);

  const fetchBrand = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.from('brands').select('*').eq('id', brandId).single();
      if (data) {
        setBrand(data);
      } else {
        const found = MOCK_BRANDS.find((b) => b.id === brandId) || MOCK_BRANDS[0];
        setBrand(found);
      }
    } catch (err) {
      console.error('Brand fetch error:', err);
      const found = MOCK_BRANDS.find((b) => b.id === brandId) || MOCK_BRANDS[0];
      setBrand(found);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBrand();
  }, [brandId]);

  const handleSaveFormSchema = async (updatedSchema: any) => {
    if (!brand) return;
    setBrand({ ...brand, form_schema: updatedSchema });
    try {
      await supabase.from('brands').update({ form_schema: updatedSchema }).eq('id', brand.id);
    } catch (err) {
      console.error('Failed to update form_schema in Supabase:', err);
    }
  };

  const handleSaveThemeConfig = async (themeConfig: any, legalCopy: any) => {
    if (!brand) return;
    setBrand({ ...brand, theme_config: themeConfig, legal_copy: legalCopy });
    try {
      await supabase
        .from('brands')
        .update({ theme_config: themeConfig, legal_copy: legalCopy })
        .eq('id', brand.id);
    } catch (err) {
      console.error('Failed to update theme_config in Supabase:', err);
    }
  };

  if (loading || !brand) {
    return (
      <AdminLayout title="Brand Config">
        <div className="p-12 text-center text-slate-500 font-medium">Loading brand assets...</div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title={`${brand.name} Studio`}>
      {/* Top Header Navigation */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-200/80 pb-6">
        <div className="flex items-center gap-4">
          <Link
            href="/brands"
            className="w-9 h-9 rounded-xl bg-white hover:bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-600 transition-colors shadow-2xs"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight font-heading">
                {brand.name}
              </h2>
              <span
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: brand.theme_config?.primary_color || '#2563eb' }}
              />
            </div>
            <p className="text-xs text-slate-400 font-medium">
              Domain: <span className="font-mono text-slate-700 font-bold">{brand.domain}</span>
            </p>
          </div>
        </div>

        {/* Studio Tabs */}
        <div className="flex items-center gap-2 bg-slate-200/60 p-1 rounded-2xl border border-slate-200">
          <button
            onClick={() => setActiveTab('form')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'form'
                ? 'bg-white text-blue-600 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>Form Builder</span>
          </button>
          <button
            onClick={() => setActiveTab('theme')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'theme'
                ? 'bg-white text-blue-600 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Palette className="w-4 h-4" />
            <span>Theme & Legal Editor</span>
          </button>
        </div>
      </div>

      {/* Main Tab Panels */}
      {activeTab === 'form' ? (
        <FormBuilder brand={brand} onSave={handleSaveFormSchema} />
      ) : (
        <ThemeEditor brand={brand} onSave={handleSaveThemeConfig} />
      )}
    </AdminLayout>
  );
}
