import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export async function getBrandBySlugOrDomain(identifier: string) {
  if (!supabaseUrl || !supabaseAnonKey) {
    return null;
  }

  // Try matching by slug first (for dev overrides), then by domain
  const { data: bySlug } = await supabase
    .from('brands')
    .select('*')
    .eq('slug', identifier)
    .eq('is_active', true)
    .maybeSingle();

  if (bySlug) return bySlug;

  const { data: byDomain } = await supabase
    .from('brands')
    .select('*')
    .eq('domain', identifier)
    .eq('is_active', true)
    .maybeSingle();

  return byDomain || null;
}
