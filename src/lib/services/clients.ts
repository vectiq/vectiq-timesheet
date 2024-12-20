import { mockClients } from './mockData';
import type { Client } from '@/types';

export async function getClients(): Promise<Client[]> {
  await new Promise(resolve => setTimeout(resolve, 500));
  return mockClients;
}

export async function createClient(client: Omit<Client, 'id'>): Promise<Client> {
  await new Promise(resolve => setTimeout(resolve, 500));
  const newClient = {
    ...client,
    id: `client_${Date.now()}`,
  };
  mockClients.push(newClient);
  return newClient;
}

export async function updateClient(id: string, client: Partial<Client>): Promise<Client> {
  await new Promise(resolve => setTimeout(resolve, 500));
  const index = mockClients.findIndex(c => c.id === id);
  if (index === -1) throw new Error('Client not found');
  
  mockClients[index] = {
    ...mockClients[index],
    ...client,
  };
  return mockClients[index];
}

export async function deleteClient(id: string): Promise<void> {
  await new Promise(resolve => setTimeout(resolve, 500));
  const index = mockClients.findIndex(c => c.id === id);
  if (index === -1) throw new Error('Client not found');
  mockClients.splice(index, 1);
}