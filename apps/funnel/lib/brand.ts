import { headers, cookies } from 'next/headers';
import { supabase } from './supabase/client';
import { Brand } from '@/types';

export async function getCurrentBrand(): Promise<Brand | null> {
  const headerList = await headers();
  const cookieStore = await cookies();

  const brandSlug = headerList.get('x-brand-slug');
  const brandHost = headerList.get('x-brand-host');
  const cookieOverride = cookieStore.get('brand_override')?.value;

  // 1. Try slug from header (set by middleware) or cookie override
  const targetSlug = brandSlug || cookieOverride;

  if (targetSlug) {
    const { data: brandBySlug } = await supabase
      .from('brands')
      .select('*')
      .eq('slug', targetSlug)
      .eq('is_active', true)
      .maybeSingle();

    if (brandBySlug) {
      return brandBySlug as Brand;
    }
  }

  // 2. Fallback to domain matching
  if (brandHost) {
    const domainOnly = brandHost.split(':')[0];
    const { data: brandByDomain } = await supabase
      .from('brands')
      .select('*')
      .eq('domain', domainOnly)
      .eq('is_active', true)
      .maybeSingle();

    if (brandByDomain) {
      return brandByDomain as Brand;
    }
  }

  // 3. Fallback for default local development if no host header present
  const { data: defaultBrand } = await supabase
    .from('brands')
    .select('*')
    .eq('slug', 'windowhound')
    .eq('is_active', true)
    .maybeSingle();

  return (defaultBrand as Brand) || null;
}
