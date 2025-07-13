'use client';

import { PageHeader } from '@/components/page-header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { getPetById } from '@/lib/placeholder-data';
import { notFound } from 'next/navigation';
import Image from 'next/image';
import { useLanguage } from '@/features/language/contexts/language-context';

export function PetProfilePage({ petId }: { petId: string }) {
  const pet = getPetById(petId);
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
              <Image
                src={pet.photoUrl}
                alt={pet.name}
                width={150}
                height={150}
                className="rounded-lg object-cover"
                data-ai-hint="pet portrait"
              />
              <div className="grid gap-2 flex-1">
                <h2 className="text-2xl font-bold">{pet.name}</h2>
                <div className="text-muted-foreground">
                  {pet.breed}, {pet.age} {t('pet.age', { count: pet.age })}
                </div>
                <p className="text-sm mt-2">
                  <strong className="font-medium">
                    {t('pet.grooming_notes')}:
                  </strong>{' '}
                  {pet.groomingNotes}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{t('pet.visit_history')}</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t('pet.date')}</TableHead>
                  <TableHead>{t('dashboard.services')}</TableHead>
                  <TableHead>{t('pet.notes')}</TableHead>
                  <TableHead className="text-right">{t('pet.price')}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pet.visits.length > 0 ? (
                  pet.visits.map((visit) => (
                    <TableRow key={visit.id}>
                      <TableCell>
                        {new Date(visit.date).toLocaleDateString()}
                      </TableCell>
                      <TableCell>{visit.services.join(', ')}</TableCell>
                      <TableCell>{visit.notes}</TableCell>
                      <TableCell className="text-right">
                        ${visit.price.toFixed(2)}
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center">
                      No visit history found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
