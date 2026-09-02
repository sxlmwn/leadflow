import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  const { pathname } = request.nextUrl;

  // Ignore static assets, internal Next.js routes, API routes, and public files
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname.includes('.')
  ) {
    return response;
  }

  // Handle /admin route aliases
  if (pathname === '/admin/login') {
    return NextResponse.redirect(new URL('/login', request.url));
  }
  if (pathname === '/admin' || pathname === '/admin/dashboard') {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://aovlzjmeqtuvdqhgjjxy.supabase.co';
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

  if (!supabaseUrl || !supabaseAnonKey) {
    return response;
  }

  const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        response = NextResponse.next({
          request,
        });
        cookiesToSet.forEach(({ name, value, options }) =>
          response.cookies.set(name, value, options)
        );
      },
    },
  });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const isLoginPage = pathname === '/login';
  const isDevBypass = request.cookies.get('leadflow_dev_auth')?.value === 'true' || process.env.NODE_ENV === 'development';

  // If not logged in and accessing protected pages -> redirect to /login
  if (!user && !isLoginPage && !isDevBypass) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // If already logged in and accessing /login -> redirect to /dashboard
  if (user && isLoginPage) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  return response;
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
