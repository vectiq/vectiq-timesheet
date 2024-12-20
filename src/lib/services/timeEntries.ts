import { 
  collection,
  doc,
  getDocs, 
  setDoc,
  updateDoc,
  deleteDoc,
  serverTimestamp,
  query,
  where,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { TimeEntry } from '@/types';

const COLLECTION = 'timeEntries';

export async function getTimeEntries(userId?: string): Promise<TimeEntry[]> {
  const baseQuery = collection(db, COLLECTION);
  const queryRef = userId 
    ? query(baseQuery, where('userId', '==', userId))
    : baseQuery;
    
  const snapshot = await getDocs(queryRef);
  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  })) as TimeEntry[];
}

export async function createTimeEntry(entryData: Omit<TimeEntry, 'id'>): Promise<TimeEntry> {
  const entryRef = doc(collection(db, COLLECTION));
  const entry: TimeEntry = {
    id: entryRef.id,
    ...entryData,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  };
  
  await setDoc(entryRef, entry);
  return entry;
}

export async function updateTimeEntry(id: string, entryData: Partial<TimeEntry>): Promise<void> {
  const entryRef = doc(db, COLLECTION, id);
  await updateDoc(entryRef, {
    ...entryData,
    updatedAt: serverTimestamp(),
  });
}

export async function deleteTimeEntry(id: string): Promise<void> {
  const entryRef = doc(db, COLLECTION, id);
  await deleteDoc(entryRef);
}