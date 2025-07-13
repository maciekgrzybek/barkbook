import { redirect } from 'next/navigation';
import { CreateSalonPage } from '@/features/salon/components/CreateSalonPage';
import { createSupabaseServerClient } from '@/core/supabase/server';
import { getSalonForUser } from '@/features/salon/actions/get-salon-for-user';

export default async function Page() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    return redirect('/login');
  }

  const salon = await getSalonForUser(session.user.id);

  if (salon) {
    return redirect('/dashboard');
  }

  return <CreateSalonPage />;
}
