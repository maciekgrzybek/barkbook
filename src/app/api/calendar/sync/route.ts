import { NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/core/supabase/server';

export async function POST() {
  // Placeholder manual sync endpoint. Full implementation would call Cal.com API and upsert events
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ ok: false }, { status: 401 });

  return NextResponse.json({ ok: true });
}


