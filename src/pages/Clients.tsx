import { useState } from 'react';
import { useClients } from '@/lib/hooks/useClients';
import { ClientsTable } from '@/components/clients/ClientsTable';
import { ClientDialog } from '@/components/clients/ClientDialog';
import { LoadingScreen } from '@/components/ui/LoadingScreen';
import { Button } from '@/components/ui/Button';
import { Plus } from 'lucide-react';
import type { Client } from '@/types';

export default function Clients() {
  const { clients, isLoading, createClient, updateClient, deleteClient } = useClients();
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const handleOpenCreateDialog = () => {
    setSelectedClient(null);
    setIsDialogOpen(true);
  };

  const handleSubmit = async (data: Omit<Client, 'id'>) => {
    if (selectedClient) {
      await updateClient({ id: selectedClient.id, data });
    } else {
      await createClient(data);
    }
    setIsDialogOpen(false);
  };

  const handleEdit = (client: Client) => {
    setSelectedClient(client);
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    await deleteClient(id);
  };

  if (isLoading) {
    return <LoadingScreen />;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold text-gray-900">Clients</h1>
        <Button onClick={handleOpenCreateDialog}>
          <Plus className="h-4 w-4 mr-2" />
          New Client
        </Button>
      </div>

      <div className="bg-white shadow-sm ring-1 ring-gray-900/5 rounded-lg">
        <ClientsTable 
          clients={clients} 
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      </div>

      <ClientDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        client={selectedClient}
        onSubmit={handleSubmit}
      />
    </div>
  );
}