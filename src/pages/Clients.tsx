import { useClients } from '@/lib/hooks/useClients';
import { Card } from '@/components/ui/Card';
import { LoadingScreen } from '@/components/ui/LoadingScreen';

export default function Clients() {
  const { clients, isLoading } = useClients();

  if (isLoading) {
    return <LoadingScreen />;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold text-gray-900">Clients</h1>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {clients.map((client) => (
          <Card key={client.id}>
            <h3 className="text-lg font-medium text-gray-900">{client.name}</h3>
            <dl className="mt-2 space-y-2">
              <div>
                <dt className="text-sm font-medium text-gray-500">Contact Email</dt>
                <dd className="mt-1 text-sm text-gray-900">{client.email}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Approver Email</dt>
                <dd className="mt-1 text-sm text-gray-900">{client.approverEmail}</dd>
              </div>
            </dl>
          </Card>
        ))}
      </div>
    </div>
  );
}