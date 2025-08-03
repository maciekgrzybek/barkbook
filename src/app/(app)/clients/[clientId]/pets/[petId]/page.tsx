'use client';

import { PetDetails } from '@/features/pets/components/PetDetails';
import { useClients } from '@/features/clients/contexts/client-context';
import { useParams } from 'next/navigation';
import { Skeleton } from '@/components/ui/skeleton';

export default function PetPage() {
  const { clientId, petId } = useParams();
  const { getClientById, isLoading } = useClients();

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-48 w-full" />
        <Skeleton className="h-48 w-full" />
      </div>
    );
  }

  const client = getClientById(clientId as string);
  const pet = client?.pets.find((p) => p.id === petId);

  return <PetDetails pet={pet} ownerId={clientId as string} />;
}
