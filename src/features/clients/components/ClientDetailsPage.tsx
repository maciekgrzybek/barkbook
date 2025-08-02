'use client';

import Link from 'next/link';
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
import { notFound, useParams } from 'next/navigation';
import { PlusCircle, Mail, Phone, PawPrint } from 'lucide-react';
import { useLanguage } from '@/features/language/contexts/language-context';
import { useClients } from '@/features/clients/contexts/client-context';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import React from 'react';

export function ClientDetailsPage() {
  const { clientId } = useParams();
  const { getClientById, isLoading, addPet } = useClients();
  const { t } = useLanguage();
  const [isDialogOpen, setIsDialogOpen] = React.useState(false);

  const [newPetName, setNewPetName] = React.useState('');
  const [newPetBreed, setNewPetBreed] = React.useState('');
  const [newPetAge, setNewPetAge] = React.useState('');

  const client = getClientById(clientId as string);

  const handleAddPet = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPetName || !newPetBreed || !newPetAge) return;

    addPet(
      {
        name: newPetName,
        breed: newPetBreed,
        age: parseInt(newPetAge, 10),
      },
      clientId as string
    );

    setNewPetName('');
    setNewPetBreed('');
    setNewPetAge('');
    setIsDialogOpen(false);
  };

  if (isLoading) {
    return (
      <>
        <PageHeader title={t('client.contact_info')}>
          <Skeleton className="h-8 w-48" />
        </PageHeader>
        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>{t('client.contact_info')}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-4">
                <Mail className="h-5 w-5 text-muted-foreground" />
                <Skeleton className="h-5 w-48" />
              </div>
              <div className="flex items-center gap-4">
                <Phone className="h-5 w-5 text-muted-foreground" />
                <Skeleton className="h-5 w-32" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <PawPrint className="h-5 w-5 text-muted-foreground" />
                {t('client.pets_owned')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
              </div>
            </CardContent>
          </Card>
        </div>
      </>
    );
  }

  if (!client) {
    notFound();
  }

  return (
    <>
      <PageHeader title={client.name} />

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>{t('client.contact_info')}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-4">
              <Mail className="h-5 w-5 text-muted-foreground" />
              <span>{client.email}</span>
            </div>
            <div className="flex items-center gap-4">
              <Phone className="h-5 w-5 text-muted-foreground" />
              <span>{client.phone_number}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <PawPrint className="h-5 w-5 text-muted-foreground" />
              {t('client.pets_owned')}
            </CardTitle>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button size="sm">
                  <PlusCircle className="mr-2 h-4 w-4" />
                  {t('client.add_pet')}
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px]">
                <form onSubmit={handleAddPet}>
                  <DialogHeader>
                    <DialogTitle>{t('client.add_pet')}</DialogTitle>
                    <DialogDescription>
                      {t('client.add_pet_description')}
                    </DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="name" className="text-right">
                        {t('pet.name')}
                      </Label>
                      <Input
                        id="name"
                        value={newPetName}
                        onChange={(e) => setNewPetName(e.target.value)}
                        className="col-span-3"
                        placeholder="e.g. Buddy"
                        required
                      />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="breed" className="text-right">
                        {t('pet.breed')}
                      </Label>
                      <Input
                        id="breed"
                        value={newPetBreed}
                        onChange={(e) => setNewPetBreed(e.target.value)}
                        className="col-span-3"
                        placeholder="e.g. Golden Retriever"
                        required
                      />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="age" className="text-right">
                        {t('pet.age')}
                      </Label>
                      <Input
                        id="age"
                        type="number"
                        value={newPetAge}
                        onChange={(e) => setNewPetAge(e.target.value)}
                        className="col-span-3"
                        placeholder="e.g. 5"
                        required
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button type="submit">{t('save')}</Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </CardHeader>
          <CardContent>
            {client.pets && client.pets.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t('pet.profile')}</TableHead>
                    <TableHead>{t('pet.breed')}</TableHead>
                    <TableHead>{t('pet.age')}</TableHead>
                    <TableHead>
                      <span className="sr-only">Actions</span>
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {client.pets.map((pet) => (
                    <TableRow key={pet.id}>
                      <TableCell className="font-medium">{pet.name}</TableCell>
                      <TableCell>{pet.breed}</TableCell>
                      <TableCell>{pet.age}</TableCell>
                      <TableCell className="text-right">
                        <Button asChild variant="outline" size="sm">
                          <Link href={`/clients/${clientId}/pets/${pet.id}`}>
                            View
                          </Link>
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <div className="text-center text-muted-foreground py-8">
                No pets added for this client yet.
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </>
  );
}
