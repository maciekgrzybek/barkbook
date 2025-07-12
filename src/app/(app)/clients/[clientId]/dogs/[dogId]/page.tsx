import { DogProfilePage } from '@/features/dogs/components/DogDetailsPage';

export default function Page({ params }: { params: { dogId: string } }) {
  return <DogProfilePage dogId={params.dogId} />;
}
