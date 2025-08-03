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
import { MoreHorizontal, PlusCircle, Trash2 } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
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

export function PetsPage() {
  const { t } = useLanguage();
  const { clients, isLoading, deletePet, allPets } = useClients();
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddPetDialogOpen, setIsAddPetDialogOpen] = useState(false);

  const allPetsWithOwners = useMemo(() => {
    return allPets.map((pet) => {
      // Find the owner of this pet by checking if the pet is in any client's pets array
      const owner = clients.find((client) =>
        client.pets.some((clientPet) => clientPet.id === pet.id)
      );
      return { ...pet, owner };
    });
  }, [allPets, clients]);

  const filteredPets = useMemo(() => {
    return allPetsWithOwners.filter((pet) =>
      pet.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [allPetsWithOwners, searchTerm]);

  const handleDeletePet = (petId: string, ownerId?: string) => {
    if (ownerId) {
      deletePet(petId, ownerId);
    }
  };

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
                  <span className="sr-only">{t('actions')}</span>
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
                        {pet.owner ? (
                          <Link href={`/clients/${pet.owner.id}`}>
                            {pet.owner.name} {pet.owner.surname}
                          </Link>
                        ) : (
                          t('no_owner')
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <AlertDialog>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" className="h-8 w-8 p-0">
                                <span className="sr-only">Open menu</span>
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuLabel>
                                {t('actions')}
                              </DropdownMenuLabel>
                              <DropdownMenuItem asChild>
                                {pet.owner ? (
                                  <Link
                                    href={`/clients/${pet.owner.id}/pets/${pet.id}`}
                                  >
                                    {t('view')}
                                  </Link>
                                ) : (
                                  <span className="cursor-not-allowed opacity-50">
                                    {t('view')}
                                  </span>
                                )}
                              </DropdownMenuItem>
                              <AlertDialogTrigger asChild>
                                <DropdownMenuItem
                                  onSelect={(e) => e.preventDefault()}
                                  className="text-red-600"
                                  disabled={!pet.owner}
                                >
                                  <Trash2 className="mr-2 h-4 w-4" />
                                  {t('pet.delete')}
                                </DropdownMenuItem>
                              </AlertDialogTrigger>
                            </DropdownMenuContent>
                          </DropdownMenu>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>
                                {t('are_you_sure')}
                              </AlertDialogTitle>
                              <AlertDialogDescription>
                                {t('pet.delete_confirm_message')}
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>
                                {t('cancel')}
                              </AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() =>
                                  pet.owner &&
                                  handleDeletePet(pet.id, pet.owner.id)
                                }
                              >
                                {t('delete')}
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
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
