import { StateCreator } from 'zustand';
import type { Client } from '@/types';

export interface ClientsSlice {
  clients: Client[];
  setClients: (clients: Client[]) => void;
}

export const createClientsSlice: StateCreator<ClientsSlice> = (set) => ({
  clients: [],
  setClients: (clients) => set({ clients }),
});