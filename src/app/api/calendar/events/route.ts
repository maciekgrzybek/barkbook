import { NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/core/supabase/server';

export async function GET() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ events: [] });

  const { data: salon } = await supabase
    .from('salons')
    .select('id')
    .eq('user_id', user.id)
    .maybeSingle();

  if (!salon) return NextResponse.json({ events: [] });

  const { data } = await supabase
    .from('calendar_events')
    .select('*')
    .eq('salon_id', salon.id)
    .order('start_time', { ascending: true });

  return NextResponse.json({ events: data ?? [] });
}


