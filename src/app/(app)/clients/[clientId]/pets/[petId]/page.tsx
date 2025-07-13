import { PetProfilePage } from '@/features/pets/components/PetDetailsPage';

export default function Page({ params }: { params: { petId: string } }) {
  return <PetProfilePage petId={params.petId} />;
}
