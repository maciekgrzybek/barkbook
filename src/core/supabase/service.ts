import { createClient } from '@supabase/supabase-js';
import type { Database } from '../db/database.types';

/**
 * Service role client - bypasses RLS for administrative operations
 * ONLY use this for server-side operations like webhooks, cron jobs, etc.
 * NEVER expose this to the client side or use in client components.
 */
export function createServiceRoleClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error(
      'Missing Supabase URL or Service Role Key. Make sure NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are set in your environment variables.'
    );
  }

  return createClient<Database>(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}
