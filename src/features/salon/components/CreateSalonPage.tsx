'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { createSalon } from '../actions/create-salon';
import { useRouter } from 'next/navigation';

const formSchema = z.object({
  name: z.string().min(2, 'Nazwa salonu musi mieć co najmniej 2 znaki.'),
  address: z.string().optional(),
  nip: z.string().optional(),
});

export function CreateSalonPage() {
  const { toast } = useToast();
  const router = useRouter();
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      address: '',
      nip: '',
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    const result = await createSalon(values);

    if (result.success) {
      toast({
        title: 'Sukces!',
        description: 'Twój salon został pomyślnie utworzony.',
      });
      router.push('/dashboard');
    } else {
      toast({
        title: 'Błąd',
        description: result.error,
        variant: 'destructive',
      });
    }
  }

  return (
    <div className="w-full max-w-md p-8 space-y-8 bg-white rounded-lg shadow-md">
      <div className="text-center">
        <h1 className="text-2xl font-bold">Utwórz profil swojego salonu</h1>
        <p className="text-gray-600">
          Zanim zaczniesz, podaj podstawowe informacje o swojej działalności.
        </p>
      </div>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nazwa salonu</FormLabel>
                <FormControl>
                  <Input placeholder="np. BarkBook Grooming" {...field} />
                </FormControl>
                <FormDescription>To jest nazwa Twojego salonu.</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="address"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Adres (opcjonalnie)</FormLabel>
                <FormControl>
                  <Input
                    placeholder="np. ul. Psia 1, 00-001 Warszawa"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="nip"
            render={({ field }) => (
              <FormItem>
                <FormLabel>NIP (opcjonalnie)</FormLabel>
                <FormControl>
                  <Input placeholder="np. 123-456-78-90" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button type="submit" className="w-full">
            Zapisz i kontynuuj
          </Button>
        </form>
      </Form>
    </div>
  );
}
