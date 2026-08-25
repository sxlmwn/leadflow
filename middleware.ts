import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

export async function middleware(request: NextRequest) {
  // Ignore static assets and Next.js internal routes
  const { pathname } = request.nextUrl;
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname.includes('.')
  ) {
    return NextResponse.next();
  }

  // 1. Resolve host and dev override (query param or cookie)
  const host = request.headers.get('host') || 'localhost:3000';
  const queryBrand = request.nextUrl.searchParams.get('brand');
  const cookieBrand = request.cookies.get('brand_override')?.value;
  
  const devOverrideSlug = queryBrand || cookieBrand;

  let resolvedSlug: string | null = null;
  let resolvedId: string | null = null;

  if (supabaseUrl && supabaseAnonKey) {
    const supabase = createClient(supabaseUrl, supabaseAnonKey);

    if (devOverrideSlug) {
      // Look up dev override by slug
      const { data: brandBySlug } = await supabase
        .from('brands')
        .select('id, slug')
        .eq('slug', devOverrideSlug)
        .eq('is_active', true)
        .maybeSingle();

      if (brandBySlug) {
        resolvedSlug = brandBySlug.slug;
        resolvedId = brandBySlug.id;
      }
    }

    if (!resolvedSlug) {
      // Look up by request domain
      const hostnameOnly = host.split(':')[0]; // Strip port number if local
      const { data: brandByDomain } = await supabase
        .from('brands')
        .select('id, slug')
        .eq('domain', hostnameOnly)
        .eq('is_active', true)
        .maybeSingle();

      if (brandByDomain) {
        resolvedSlug = brandByDomain.slug;
        resolvedId = brandByDomain.id;
      }
    }
  }

  // Pass resolved brand information to request headers
  const requestHeaders = new Headers(request.headers);
  if (resolvedSlug) {
    requestHeaders.set('x-brand-slug', resolvedSlug);
  }
  if (resolvedId) {
    requestHeaders.set('x-brand-id', resolvedId);
  }
  requestHeaders.set('x-brand-host', host);

  const response = NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });

  // If brand was passed via query param, persist it in cookie for local dev navigation
  if (queryBrand) {
    response.cookies.set('brand_override', queryBrand, {
      path: '/',
      maxAge: 60 * 60 * 24 * 7, // 1 week
      sameSite: 'lax',
    });
  }

  return response;
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
