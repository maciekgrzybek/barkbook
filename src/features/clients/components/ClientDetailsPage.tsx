'use client';

import Link from 'next/link';
import { PageHeader } from '@/components/page-header';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
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
import Image from 'next/image';
import { useClients } from '@/features/clients/contexts/client-context';
import { Skeleton } from '@/components/ui/skeleton';

export function ClientDetailsPage() {
  const { clientId } = useParams();
  const { getClientById, isLoading } = useClients();
  const { t } = useLanguage();

  const client = getClientById(clientId as string);

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
              <span>{client.phone}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <PawPrint className="h-5 w-5 text-muted-foreground" />
              {t('client.pets_owned')}
            </CardTitle>
            <Button size="sm">
              <PlusCircle className="mr-2 h-4 w-4" />
              {t('client.add_pet')}
            </Button>
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
                      <TableCell className="font-medium flex items-center gap-2">
                        <Image
                          src={pet.photoUrl}
                          alt={pet.name}
                          width={32}
                          height={32}
                          className="rounded-full object-cover"
                          data-ai-hint="pet portrait"
                        />
                        {pet.name}
                      </TableCell>
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
