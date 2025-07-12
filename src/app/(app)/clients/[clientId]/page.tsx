import { ClientDetailPage } from '@/features/clients/components/ClientDetailsPage';

export default function Page({ params }: { params: { clientId: string } }) {
  return <ClientDetailPage clientId={params.clientId} />;
}
