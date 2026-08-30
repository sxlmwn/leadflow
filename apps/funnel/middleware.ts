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

  // 1. Resolve host and dev override
  const host =
    request.headers.get('x-forwarded-host') ||
    request.headers.get('host') ||
    'localhost:3000';
  const hostnameOnly = host.split(':')[0].toLowerCase();
  const isLocalhost =
    hostnameOnly === 'localhost' ||
    hostnameOnly === '127.0.0.1' ||
    hostnameOnly.endsWith('.local');

  const queryBrand = request.nextUrl.searchParams.get('brand');
  const cookieBrand = request.cookies.get('brand_override')?.value;

  let resolvedSlug: string | null = null;
  let resolvedId: string | null = null;

  if (supabaseUrl && supabaseAnonKey) {
    try {
      const supabase = createClient(supabaseUrl, supabaseAnonKey);

      // A. Query parameter has explicit highest priority if provided
      if (queryBrand) {
        const { data: brandByQuery } = await supabase
          .from('brands')
          .select('id, slug')
          .eq('slug', queryBrand)
          .eq('is_active', true)
          .maybeSingle();

        if (brandByQuery) {
          resolvedSlug = brandByQuery.slug;
          resolvedId = brandByQuery.id;
        }
      }

      // B. If not resolved by query param, try matching host domain
      if (!resolvedSlug && !isLocalhost) {
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

      // C. If local dev or localhost, check cookie override
      if (!resolvedSlug && isLocalhost && cookieBrand) {
        const { data: brandByCookie } = await supabase
          .from('brands')
          .select('id, slug')
          .eq('slug', cookieBrand)
          .eq('is_active', true)
          .maybeSingle();

        if (brandByCookie) {
          resolvedSlug = brandByCookie.slug;
          resolvedId = brandByCookie.id;
        }
      }
    } catch (e) {
      console.error('Middleware brand resolution error:', e);
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

  // If brand was explicitly passed via query param, persist it in cookie
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
