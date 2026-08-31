import { headers, cookies } from 'next/headers';
import { supabase } from './supabase/client';
import { Brand } from '@/types';

export async function getCurrentBrand(): Promise<Brand | null> {
  const headerList = await headers();
  const cookieStore = await cookies();

  const brandSlug = headerList.get('x-brand-slug');
  const brandId = headerList.get('x-brand-id');
  const host =
    headerList.get('x-brand-host') ||
    headerList.get('x-forwarded-host') ||
    headerList.get('host') ||
    'localhost:3000';
  const hostnameOnly = host.split(':')[0].toLowerCase();
  const isLocalhost =
    hostnameOnly === 'localhost' ||
    hostnameOnly === '127.0.0.1' ||
    hostnameOnly.endsWith('.local');
  const cookieOverride = cookieStore.get('brand_override')?.value;

  // 1. If middleware resolved the brand slug or id, load it directly
  if (brandSlug) {
    const { data: brandBySlug } = await supabase
      .from('brands')
      .select('*')
      .eq('slug', brandSlug)
      .eq('is_active', true)
      .maybeSingle();

    if (brandBySlug) {
      return brandBySlug as Brand;
    }
  }

  if (brandId) {
    const { data: brandById } = await supabase
      .from('brands')
      .select('*')
      .eq('id', brandId)
      .eq('is_active', true)
      .maybeSingle();

    if (brandById) {
      return brandById as Brand;
    }
  }

  // 2. Direct domain lookup (essential fallback if middleware headers are not passed)
  if (!isLocalhost && hostnameOnly) {
    const { data: brandByDomain } = await supabase
      .from('brands')
      .select('*')
      .eq('domain', hostnameOnly)
      .eq('is_active', true)
      .maybeSingle();

    if (brandByDomain) {
      return brandByDomain as Brand;
    }
  }

  // 3. Localhost / Dev cookie override
  if (isLocalhost && cookieOverride) {
    const { data: brandByCookie } = await supabase
      .from('brands')
      .select('*')
      .eq('slug', cookieOverride)
      .eq('is_active', true)
      .maybeSingle();

    if (brandByCookie) {
      return brandByCookie as Brand;
    }
  }

  // If not matched via query param, domain mapping, or dev cookie override, return null (renders Brand Not Found)
  return null;
}

