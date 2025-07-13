import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { createServerClient } from '@supabase/ssr';

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value;
        },
        set(name: string, value: string, options) {
          request.cookies.set({ name, value, ...options });
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          });
          response.cookies.set({ name, value, ...options });
        },
        remove(name: string, options) {
          request.cookies.set({ name, value: '', ...options });
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          });
          response.cookies.set({ name, value: '', ...options });
        },
      },
    }
  );

  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (session) {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (user) {
      const { data: salon, error } = await supabase
        .from('salons')
        .select('id')
        .eq('user_id', user.id)
        .single();

      const hasSalon = salon !== null;
      const isAtCreateSalon =
        request.nextUrl.pathname.startsWith('/create-salon');

      const isAtPublicPage = ['/login', '/register', '/auth/callback'].some(
        (path) => request.nextUrl.pathname.startsWith(path)
      );

      if (isAtPublicPage) {
        return NextResponse.redirect(new URL('/dashboard', request.url));
      }

      if (!hasSalon && !isAtCreateSalon) {
        return NextResponse.redirect(new URL('/create-salon', request.url));
      }

      if (hasSalon && isAtCreateSalon) {
        return NextResponse.redirect(new URL('/dashboard', request.url));
      }
    }
  } else {
    const publicPaths = ['/login', '/register', '/auth/callback'];
    if (
      !publicPaths.some((path) => request.nextUrl.pathname.startsWith(path))
    ) {
      return NextResponse.redirect(new URL('/login', request.url));
    }
  }

  return response;
}

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/login',
    '/register',
    '/create-salon',
    '/auth/callback',
  ],
};
