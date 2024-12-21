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
  orderBy,
} from 'firebase/firestore';
import { format } from 'date-fns';
import { db } from '@/lib/firebase';
import type { TimeEntry } from '@/types';

const COLLECTION = 'timeEntries';

export async function getTimeEntries(
  userId?: string,
  dateRange?: { start: Date; end: Date }
): Promise<TimeEntry[]> {
  const baseQuery = collection(db, COLLECTION);
  let constraints: any[] = [];
  
  // Add user filter if provided
  if (userId) {
    constraints.push(where('userId', '==', userId));
  }
  
  // Add date range filters if provided
  if (dateRange) {
    const startDate = format(dateRange.start, 'yyyy-MM-dd');
    const endDate = format(dateRange.end, 'yyyy-MM-dd');
    
    constraints.push(
      where('date', '>=', startDate),
      where('date', '<=', endDate)
    );
  }
  
  // Add ordering by date
  constraints.push(orderBy('date', 'asc'));
  
  // Build query with all constraints
  const queryRef = constraints.length > 0
    ? query(baseQuery, ...constraints)
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