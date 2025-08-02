'use client';

import Link from 'next/link';
import React, { useState } from 'react';
import { PlusCircle } from 'lucide-react';
import { PageHeader } from '@/components/page-header';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
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
import { useLanguage } from '@/features/language/contexts/language-context';
import { useClients } from '@/features/clients/contexts/client-context';
import { Skeleton } from '@/components/ui/skeleton';

export function ClientsPage() {
  const { t } = useLanguage();
  const { clients, addClient, isLoading } = useClients();
  const [newClientName, setNewClientName] = useState('');
  const [newClientSurname, setNewClientSurname] = useState('');
  const [newClientEmail, setNewClientEmail] = useState('');
  const [newClientPhone, setNewClientPhone] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const handleAddClient = (e: React.FormEvent) => {
    e.preventDefault();
    if (
      !newClientName ||
      !newClientSurname ||
      !newClientEmail ||
      !newClientPhone
    )
      return;

    addClient({
      name: newClientName,
      surname: newClientSurname,
      email: newClientEmail,
      phone_number: newClientPhone,
    });

    setNewClientName('');
    setNewClientSurname('');
    setNewClientEmail('');
    setNewClientPhone('');
    setIsDialogOpen(false);
  };

  return (
    <>
      <PageHeader title={t('clients.title')}>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <PlusCircle className="mr-2 h-4 w-4" />
              {t('clients.add')}
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <form onSubmit={handleAddClient}>
              <DialogHeader>
                <DialogTitle>{t('clients.add')}</DialogTitle>
                <DialogDescription>
                  {t('clients.add_description')}
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="name" className="text-right">
                    {t('clients.name')}
                  </Label>
                  <Input
                    id="name"
                    value={newClientName}
                    onChange={(e) => setNewClientName(e.target.value)}
                    className="col-span-3"
                    placeholder="e.g. John"
                    required
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="surname" className="text-right">
                    Surname
                  </Label>
                  <Input
                    id="surname"
                    value={newClientSurname}
                    onChange={(e) => setNewClientSurname(e.target.value)}
                    className="col-span-3"
                    placeholder="e.g. Doe"
                    required
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="email" className="text-right">
                    {t('email')}
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    value={newClientEmail}
                    onChange={(e) => setNewClientEmail(e.target.value)}
                    className="col-span-3"
                    placeholder="e.g. john@example.com"
                    required
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="phone" className="text-right">
                    {t('clients.phone')}
                  </Label>
                  <Input
                    id="phone"
                    value={newClientPhone}
                    onChange={(e) => setNewClientPhone(e.target.value)}
                    className="col-span-3"
                    placeholder="e.g. +48 123 456 789"
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
      </PageHeader>
      <Card>
        <CardContent className="pt-6">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t('clients.name')}</TableHead>
                <TableHead>{t('clients.phone')}</TableHead>
                <TableHead>{t('email')}</TableHead>
                <TableHead>{t('clients.pets')}</TableHead>
                <TableHead className="text-right">
                  <span className="sr-only">{t('edit')}</span>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading
                ? Array.from({ length: 3 }).map((_, i) => (
                    <TableRow key={i}>
                      <TableCell>
                        <Skeleton className="h-5 w-32" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-5 w-24" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-5 w-40" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-5 w-8" />
                      </TableCell>
                      <TableCell className="text-right">
                        <Skeleton className="h-9 w-16 ml-auto" />
                      </TableCell>
                    </TableRow>
                  ))
                : clients.map((client) => (
                    <TableRow key={client.id}>
                      <TableCell className="font-medium">
                        {client.name} {client.surname}
                      </TableCell>
                      <TableCell>{client.phone_number}</TableCell>
                      <TableCell>{client.email}</TableCell>
                      <TableCell>{client.pets.length}</TableCell>
                      <TableCell className="text-right">
                        <Button asChild variant="outline" size="sm">
                          <Link href={`/clients/${client.id}`}>View</Link>
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </>
  );
}
