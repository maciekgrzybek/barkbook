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
import { notFound } from 'next/navigation';
import { PlusCircle, Mail, Phone, Dog } from 'lucide-react';
import { useLanguage } from '@/features/language/contexts/language-context';
import Image from 'next/image';
import { useClients } from '@/features/clients/contexts/client-context';
import { Skeleton } from '@/components/ui/skeleton';

export function ClientDetailPage({ clientId }: { clientId: string }) {
  const { getClientById, isLoading } = useClients();
  const { t } = useLanguage();

  const client = getClientById(clientId);

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
                <Dog className="h-5 w-5 text-muted-foreground" />
                {t('client.dogs_owned')}
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
              <Dog className="h-5 w-5 text-muted-foreground" />
              {t('client.dogs_owned')}
            </CardTitle>
            <Button size="sm">
              <PlusCircle className="mr-2 h-4 w-4" />
              {t('client.add_dog')}
            </Button>
          </CardHeader>
          <CardContent>
            {client.dogs && client.dogs.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t('dog.profile')}</TableHead>
                    <TableHead>{t('dog.breed')}</TableHead>
                    <TableHead>{t('dog.age')}</TableHead>
                    <TableHead>
                      <span className="sr-only">Actions</span>
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {client.dogs.map((dog) => (
                    <TableRow key={dog.id}>
                      <TableCell className="font-medium flex items-center gap-2">
                        <Image
                          src={dog.photoUrl}
                          alt={dog.name}
                          width={32}
                          height={32}
                          className="rounded-full object-cover"
                          data-ai-hint="dog portrait"
                        />
                        {dog.name}
                      </TableCell>
                      <TableCell>{dog.breed}</TableCell>
                      <TableCell>{dog.age}</TableCell>
                      <TableCell className="text-right">
                        <Button asChild variant="outline" size="sm">
                          <Link href={`/clients/${clientId}/dogs/${dog.id}`}>
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
                No dogs added for this client yet.
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </>
  );
}
