'use client';

import { PageHeader } from '@/components/page-header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { notFound } from 'next/navigation';
import { useLanguage } from '@/features/language/contexts/language-context';
import { Pet } from '@/lib/types';

export function PetDetails({ pet }: { pet: Pet | undefined }) {
  const { t } = useLanguage();

  if (!pet) {
    notFound();
  }

  return (
    <>
      <PageHeader title={t('pet.profile')}>
        <Button>{t('pet.edit_profile')}</Button>
      </PageHeader>

      <div className="grid gap-6">
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row items-start gap-6">
              <div className="grid gap-2 flex-1">
                <h2 className="text-2xl font-bold">{pet.name}</h2>
                <div className="text-muted-foreground">
                  {pet.breed}, {pet.age} {t('pet.age', { count: pet.age ?? 0 })}
                </div>
                <p className="text-sm mt-2">
                  <strong className="font-medium">
                    {t('pet.grooming_notes')}:
                  </strong>{' '}
                  {pet.notes}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
