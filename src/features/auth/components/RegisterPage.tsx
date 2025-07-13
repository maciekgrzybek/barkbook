'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Logo } from '@/components/logo';
import { useLanguage } from '@/features/language/contexts/language-context';
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { createClient } from '@/core/supabase/client';

const formSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

export function RegisterPage() {
  const router = useRouter();
  const { t } = useLanguage();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const { handleSubmit, register } = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setIsLoading(true);
    const supabase = createClient();

    try {
      const { data, error } = await supabase.auth.signUp({
        email: values.email,
        password: values.password,
      });

      if (error) {
        throw error;
      }

      // If email confirmation is disabled, a session is returned.
      if (data.session) {
        router.push('/create-salon');
      } else {
        toast({
          title: 'Sukces!',
          description:
            'Rejestracja pomyślna! Sprawdź swoją skrzynkę e-mail, aby zweryfikować konto.',
        });
      }
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Rejestracja nie powiodła się',
        description: error.message || 'Wystąpił nieoczekiwany błąd.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="mx-auto max-w-sm w-full">
      <CardHeader className="text-center">
        <div className="mb-4 flex justify-center">
          <Logo />
        </div>
        <CardTitle className="text-2xl">{t('register.title')}</CardTitle>
        <CardDescription>{t('register.subtitle')}</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="email">{t('email')}</Label>
            <Input
              id="email"
              type="email"
              placeholder="m@example.com"
              required
              {...register('email')}
              disabled={isLoading}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="password">{t('password')}</Label>
            <Input
              id="password"
              type="password"
              required
              {...register('password')}
              disabled={isLoading}
            />
          </div>
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {t('register.button')}
          </Button>
        </form>
        <div className="mt-4 text-center text-sm">
          {t('register.has_account')}{' '}
          <Link href="/login" className="underline text-accent">
            {t('register.login')}
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
