import { useQuery, useMutation } from '@tanstack/react-query';
import { useStore } from '@/lib/store';
import type { Client } from '@/types';

export function useClients() {
  const store = useStore();

  const query = useQuery({
    queryKey: ['clients'],
    queryFn: () => store.clients,
    initialData: [],
  });

  const createMutation = useMutation({
    mutationFn: (client: Omit<Client, 'id'>) => {
      const newClient = {
        ...client,
        id: `client_${Date.now()}`,
      };
      store.addClient(newClient);
      return newClient;
    },
  });

  const updateMutation = useMutation({
    mutationFn: (client: Client) => {
      store.updateClient(client.id, client);
      return client;
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => {
      store.deleteClient(id);
    },
  });

  return {
    clients: query.data,
    isLoading: query.isLoading,
    error: query.error,
    createClient: createMutation.mutate,
    updateClient: updateMutation.mutate,
    deleteClient: deleteMutation.mutate,
  };
}