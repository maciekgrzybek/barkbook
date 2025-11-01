import { NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/core/supabase/server';

export async function GET() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ connected: false });

  const { data, error } = await supabase
    .from('cal_com_tokens')
    .select('id, expires_at')
    .eq('user_id', user.id)
    .maybeSingle();

  if (error || !data) return NextResponse.json({ connected: false });

  return NextResponse.json({ connected: true, expires_at: data.expires_at });
}


