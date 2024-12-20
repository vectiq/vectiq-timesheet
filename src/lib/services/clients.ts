import { 
  collection,
  doc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { Client } from '@/types';

export async function getClients(): Promise<Client[]> {
  const snapshot = await getDocs(collection(db, 'clients'));
  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  })) as Client[];
}

export async function createClient(clientData: Omit<Client, 'id'>): Promise<Client> {
  const clientRef = doc(collection(db, 'clients'));
  const client: Client = {
    id: clientRef.id,
    ...clientData,
    createdAt: serverTimestamp(),
  };
  
  await setDoc(clientRef, client);
  return client;
}

export async function updateClient(id: string, clientData: Partial<Client>): Promise<void> {
  const clientRef = doc(db, 'clients', id);
  await updateDoc(clientRef, {
    ...clientData,
    updatedAt: serverTimestamp(),
  });
}

export async function deleteClient(id: string): Promise<void> {
  const clientRef = doc(db, 'clients', id);
  await deleteDoc(clientRef);
}