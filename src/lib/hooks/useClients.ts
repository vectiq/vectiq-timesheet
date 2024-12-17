import { useQuery } from '@tanstack/react-query';
import { Client } from '@/types';

const mockClients: Client[] = [
  {
    id: 'client1',
    name: 'Acme Corp',
    email: 'contact@acme.com',
    approverEmail: 'approver@acme.com',
  },
  {
    id: 'client2',
    name: 'Globex Corporation',
    email: 'contact@globex.com',
    approverEmail: 'approver@globex.com',
  },
];

async function fetchClients(): Promise<Client[]> {
  await new Promise(resolve => setTimeout(resolve, 500));
  return mockClients;
}

export function useClients() {
  const query = useQuery({
    queryKey: ['clients'],
    queryFn: fetchClients,
  });

  return {
    clients: query.data ?? [],
    isLoading: query.isLoading,
    error: query.error,
  };
}