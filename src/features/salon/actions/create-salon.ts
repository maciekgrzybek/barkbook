'use server';
import { z } from 'zod';
import { createSupabaseServerClient } from '@/core/supabase/server';
import { revalidatePath } from 'next/cache';

const salonSchema = z.object({
  name: z.string().min(2),
  address: z.string().optional(),
  nip: z.string().optional(),
});

export async function createSalon(values: z.infer<typeof salonSchema>) {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return {
      success: false,
      error: 'Użytkownik nie jest zalogowany.',
    };
  }

  const parsedData = salonSchema.safeParse(values);

  if (!parsedData.success) {
    return {
      success: false,
      error: 'Nieprawidłowe dane formularza.',
    };
  }

  const { error } = await supabase.from('salons').insert({
    ...parsedData.data,
    user_id: user.id,
  });

  if (error) {
    console.error('Error creating salon:', error);
    return {
      success: false,
      error: 'Nie udało się utworzyć salonu. Spróbuj ponownie.',
    };
  }

  revalidatePath('/', 'layout');

  return {
    success: true,
  };
}
