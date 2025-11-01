import { NextResponse } from 'next/server';
import { CalComOAuthService } from '@/core/services/oauth/cal-com-oauth';
import { cookies } from 'next/headers';
import { createSupabaseServerClient } from '@/core/supabase/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get('code');
  const state = searchParams.get('state');
  const error = searchParams.get('error');

  if (error) {
    return NextResponse.redirect(
      new URL(`/settings?error=${encodeURIComponent(error)}`, request.url)
    );
  }

  if (!code || !state) {
    return NextResponse.redirect(
      new URL('/settings?error=invalid_oauth_callback', request.url)
    );
  }

  const cookieStore = await cookies();
  const storedState = cookieStore.get('cal_oauth_state')?.value;
  if (!storedState || storedState !== state) {
    return NextResponse.redirect(
      new URL('/settings?error=csrf_mismatch', process.env.NEXT_PUBLIC_APP_URL)
    );
  }

  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  const oauth = new CalComOAuthService();
  try {
    const tokens = await oauth.exchangeCodeForTokens(code);
    const userInfo = await oauth.getUserInfo(tokens.access_token);

    const expiresAt = tokens.expires_in
      ? new Date(Date.now() + tokens.expires_in * 1000).toISOString()
      : null;

    const { error: upsertError } = await supabase.from('cal_com_tokens').upsert(
      {
        user_id: user.id,
        access_token: tokens.access_token,
        refresh_token: tokens.refresh_token ?? null,
        token_type: tokens.token_type ?? 'Bearer',
        expires_at: expiresAt,
        scope: tokens.scope ?? null,
        // Store additional Cal.com identity info in auth.users if needed via RPC/Edge
      },
      { onConflict: 'user_id' }
    );

    if (upsertError) {
      return NextResponse.redirect(
        new URL('/settings?error=token_store_failed', request.url)
      );
    }

    // Optionally store cal user id/username in user metadata via admin API (skipped here)

    cookieStore.delete('cal_oauth_state');
    return NextResponse.redirect(
      new URL('/settings?cal_connected=1', request.url)
    );
  } catch (e) {
    const message = e instanceof Error ? e.message : 'oauth_failed';
    return NextResponse.redirect(
      new URL(`/settings?error=${encodeURIComponent(message)}`, request.url)
    );
  }
}
