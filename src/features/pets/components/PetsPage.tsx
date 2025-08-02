'use client';

import React, { useMemo, useState } from 'react';
import Link from 'next/link';
import { PageHeader } from '@/components/page-header';
import { useLanguage } from '@/features/language/contexts/language-context';
import { useClients } from '@/features/clients/contexts/client-context';
import { Pet } from '@/lib/types';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { AddPetDialog } from './AddPetDialog';
import { PlusCircle } from 'lucide-react';

export function PetsPage() {
  const { t } = useLanguage();
  const { clients, isLoading } = useClients();
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddPetDialogOpen, setIsAddPetDialogOpen] = useState(false);

  const allPets = useMemo(() => {
    return clients.flatMap((client) =>
      client.pets.map((pet) => ({ ...pet, owner: client }))
    );
  }, [clients]);

  const filteredPets = useMemo(() => {
    return allPets.filter((pet) =>
      pet.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [allPets, searchTerm]);

  return (
    <>
      <PageHeader title={t('pets.title')}>
        <Button onClick={() => setIsAddPetDialogOpen(true)}>
          <PlusCircle className="mr-2 h-4 w-4" />
          {t('client.add_pet')}
        </Button>
      </PageHeader>
      <div className="mb-4">
        <Input
          placeholder={t('pets.search_placeholder')}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>
      <Card>
        <CardContent className="pt-6">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t('pets.name')}</TableHead>
                <TableHead>{t('pets.breed')}</TableHead>
                <TableHead>{t('pets.age')}</TableHead>
                <TableHead>{t('pets.owner')}</TableHead>
                <TableHead>
                  <span className="sr-only">{t('view')}</span>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading
                ? Array.from({ length: 5 }).map((_, i) => (
                    <TableRow key={i}>
                      <TableCell>
                        <Skeleton className="h-5 w-24" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-5 w-32" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-5 w-16" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-5 w-40" />
                      </TableCell>
                      <TableCell className="text-right">
                        <Skeleton className="h-9 w-16 ml-auto" />
                      </TableCell>
                    </TableRow>
                  ))
                : filteredPets.map((pet) => (
                    <TableRow key={pet.id}>
                      <TableCell className="font-medium">{pet.name}</TableCell>
                      <TableCell>{pet.breed}</TableCell>
                      <TableCell>{pet.age}</TableCell>
                      <TableCell>
                        {pet.owner.name} {pet.owner.surname}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button asChild variant="outline" size="sm">
                          <Link
                            href={`/clients/${pet.owner.id}/pets/${pet.id}`}
                          >
                            {t('view')}
                          </Link>
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      <AddPetDialog
        isOpen={isAddPetDialogOpen}
        onClose={() => setIsAddPetDialogOpen(false)}
      />
    </>
  );
}
