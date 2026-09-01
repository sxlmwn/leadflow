'use client';

import React, { useEffect, useState, use } from 'react';
import Link from 'next/link';
import { AdminLayout } from '@/components/layout/AdminLayout';
import { BrandEditor } from '@/components/brands/BrandEditor';
import { Loader } from '@/components/ui/loader';
import { supabase } from '@/lib/supabase';
import { Brand } from '@/types';

export default function BrandEditRoute({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const brandId = resolvedParams.id;

  const [brand, setBrand] = useState<Brand | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadBrand() {
      setLoading(true);
      try {
        const { data } = await supabase
          .from('brands')
          .select('*')
          .or(`id.eq.${brandId},slug.eq.${brandId}`)
          .maybeSingle();

        if (data) {
          setBrand(data as unknown as Brand);
        } else {
          setBrand(null);
        }
      } catch (err) {
        console.error('Failed to load brand:', err);
      } finally {
        setLoading(false);
      }
    }
    loadBrand();
  }, [brandId]);

  if (loading) {
    return (
      <AdminLayout title="Brand Studio">
        <div className="min-h-[50vh] flex items-center justify-center">
          <Loader
            size="lg"
            title="Loading brand configuration..."
            subtitle="Fetching theme styling, questions schema, and webhook routing"
          />
        </div>
      </AdminLayout>
    );
  }

  if (!brand) {
    return (
      <AdminLayout title="Brand Not Found">
        <div className="p-12 text-center space-y-4">
          <h2 className="text-xl font-bold text-foreground font-heading">Brand Not Found</h2>
          <p className="text-xs text-muted-foreground">The requested brand ID or slug could not be located.</p>
          <Link
            href="/brands"
            className="inline-block px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-semibold"
          >
            Back to Brands List
          </Link>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title={`${brand.name} Studio`}>
      <BrandEditor initialBrand={brand} mode="edit" />
    </AdminLayout>
  );
}
