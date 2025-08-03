'use client';

import { PageHeader } from '@/components/page-header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { notFound, useRouter } from 'next/navigation';
import { useLanguage } from '@/features/language/contexts/language-context';
import { Pet, PetVisit } from '@/lib/types';
import { useClients } from '@/features/clients/contexts/client-context';
import { Trash2 } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { VisitHistory } from './VisitHistory';
import { AddVisitDialog } from './AddVisitDialog';
import { getPetVisits } from '../actions/pet-visits';
import { useEffect, useState } from 'react';

export function PetDetails({
  pet,
  ownerId,
}: {
  pet: Pet | undefined;
  ownerId: string;
}) {
  const { t } = useLanguage();
  const { deletePet } = useClients();
  const router = useRouter();
  const [visits, setVisits] = useState<PetVisit[]>([]);
  const [isVisitsLoading, setIsVisitsLoading] = useState(true);
  const [isAddVisitDialogOpen, setIsAddVisitDialogOpen] = useState(false);

  if (!pet) {
    notFound();
  }

  useEffect(() => {
    const loadVisits = async () => {
      try {
        setIsVisitsLoading(true);
        const petVisits = await getPetVisits(pet.id);
        setVisits(petVisits);
      } catch (error) {
        console.error('Error loading visits:', error);
        setVisits([]);
      } finally {
        setIsVisitsLoading(false);
      }
    };

    loadVisits();
  }, [pet.id]);

  const handleVisitsChange = async () => {
    try {
      const petVisits = await getPetVisits(pet.id);
      setVisits(petVisits);
    } catch (error) {
      console.error('Error reloading visits:', error);
    }
  };

  const handleDelete = async () => {
    if (pet) {
      await deletePet(pet.id, ownerId);
      router.push('/pets');
    }
  };

  return (
    <>
      <PageHeader title={pet.name}>
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="destructive">
              <Trash2 className="mr-2 h-4 w-4" />
              {t('pet.delete')}
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>{t('are_you_sure')}</AlertDialogTitle>
              <AlertDialogDescription>
                {t('pet.delete_confirm_message')}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>{t('cancel')}</AlertDialogCancel>
              <AlertDialogAction onClick={handleDelete}>
                {t('delete')}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
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

        {/* Visit History Section */}
        {isVisitsLoading ? (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <div className="h-5 w-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
                {t('pet.loading_visits')}
              </CardTitle>
            </CardHeader>
          </Card>
        ) : (
          <VisitHistory
            petId={pet.id}
            visits={visits}
            onAddVisit={() => setIsAddVisitDialogOpen(true)}
            onVisitsChange={handleVisitsChange}
          />
        )}
      </div>

      {/* Add Visit Dialog */}
      <AddVisitDialog
        isOpen={isAddVisitDialogOpen}
        onClose={() => setIsAddVisitDialogOpen(false)}
        petId={pet.id}
        petName={pet.name}
        onVisitAdded={handleVisitsChange}
      />
    </>
  );
}
