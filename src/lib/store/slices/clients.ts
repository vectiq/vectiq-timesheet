import { StateCreator } from 'zustand';
import type { Client } from '@/types';

export interface ClientsSlice {
  clients: Client[];
  setClients: (clients: Client[]) => void;
  addClient: (client: Client) => void;
  updateClient: (id: string, client: Partial<Client>) => void;
  deleteClient: (id: string) => void;
}

export const createClientsSlice: StateCreator<ClientsSlice> = (set, get, store, initialClients: Client[] = []) => ({
  clients: initialClients,
  setClients: (clients) => set({ clients }),
  addClient: (client) => set((state) => ({ clients: [...state.clients, client] })),
  updateClient: (id, client) => set((state) => ({
    clients: state.clients.map(c => c.id === id ? { ...c, ...client } : c)
  })),
  deleteClient: (id) => set((state) => ({
    clients: state.clients.filter(c => c.id !== id)
  })),
});