'use server';
import { createSupabaseServerClient } from '@/core/supabase/server';

export async function getSalonForUser(userId: string) {
  const supabase = await createSupabaseServerClient();
  const { data: salon, error } = await supabase
    .from('salons')
    .select(
      `
      id,
      name,
      address,
      nip,
      user_id
    `
    )
    .eq('user_id', userId)
    .single();

  if (error && error.code !== 'PGRST116') {
    console.error('Error fetching salon for user:', error);
    return null;
  }

  return salon;
}
