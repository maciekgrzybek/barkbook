import { NextResponse } from 'next/server';
import { CalComOAuthService } from '@/core/services/oauth/cal-com-oauth';
import { cookies } from 'next/headers';
import { createSupabaseServerClient } from '@/core/supabase/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const disconnect = searchParams.get('disconnect');

  if (disconnect) {
    const supabase = await createSupabaseServerClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (user) {
      await supabase.from('cal_com_tokens').delete().eq('user_id', user.id);
    }
    return NextResponse.redirect(new URL('/settings', request.url));
  }

  const oauth = new CalComOAuthService();
  const state = oauth.generateState();
  const cookieStore = await cookies();
  cookieStore.set('cal_oauth_state', state, {
    httpOnly: true,
    sameSite: 'lax',
    secure: true,
    path: '/',
    maxAge: 60 * 10,
  });
  const url = oauth.generateAuthUrl(state);
  return NextResponse.redirect(url);
}
