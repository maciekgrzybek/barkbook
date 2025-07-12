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
import { getDogById } from '@/lib/placeholder-data';
import { notFound } from 'next/navigation';
import Image from 'next/image';
import { useLanguage } from '@/features/language/contexts/language-context';

export function DogProfilePage({ dogId }: { dogId: string }) {
  const dog = getDogById(dogId);
  const { t } = useLanguage();

  if (!dog) {
    notFound();
  }

  return (
    <>
      <PageHeader title={t('dog.profile')}>
        <Button>{t('dog.edit_profile')}</Button>
      </PageHeader>

      <div className="grid gap-6">
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row items-start gap-6">
              <Image
                src={dog.photoUrl}
                alt={dog.name}
                width={150}
                height={150}
                className="rounded-lg object-cover"
                data-ai-hint="dog portrait"
              />
              <div className="grid gap-2 flex-1">
                <h2 className="text-2xl font-bold">{dog.name}</h2>
                <div className="text-muted-foreground">
                  {dog.breed}, {dog.age} {t('dog.age', { count: dog.age })}
                </div>
                <p className="text-sm mt-2">
                  <strong className="font-medium">
                    {t('dog.grooming_notes')}:
                  </strong>{' '}
                  {dog.groomingNotes}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{t('dog.visit_history')}</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t('dog.date')}</TableHead>
                  <TableHead>{t('dashboard.services')}</TableHead>
                  <TableHead>{t('dog.notes')}</TableHead>
                  <TableHead className="text-right">{t('dog.price')}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {dog.visits.length > 0 ? (
                  dog.visits.map((visit) => (
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
