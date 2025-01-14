import { 
  collection,
  doc,
  getDocs,
  query,
  where,
  addDoc,
  deleteDoc,
  updateDoc,
  serverTimestamp,
  orderBy
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { Note } from '@/types';

const COLLECTION = 'notes';

export async function getNotes(projectId: string, month: string): Promise<Note[]> {
  if (!projectId) {
    return [];
  }

  // Query for both current month notes and pinned notes from previous months
  const q = query(
    collection(db, COLLECTION), 
    where('projectId', '==', projectId), 
    where('isPinned', '==', true),
    orderBy('createdAt', 'desc')
  );

  const currentMonthQuery = query(
    collection(db, COLLECTION),
    where('projectId', '==', projectId),
    where('month', '==', month),
    where('isPinned', '==', false),
    orderBy('createdAt', 'desc')
  );

  try {
    const [pinnedSnapshot, currentMonthSnapshot] = await Promise.all([
      getDocs(q),
      getDocs(currentMonthQuery),
    ]);

    const pinnedNotes = pinnedSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Note[];

    const currentMonthNotes = currentMonthSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Note[];
    
    return [...pinnedNotes, ...currentMonthNotes];
  } catch (error) {
    throw error;
  }
}

export async function createNote(data: Omit<Note, 'id' | 'createdAt'>): Promise<Note> {
  console.log('Creating note:', data);

  const noteRef = await addDoc(collection(db, COLLECTION), {
    ...data,
    createdAt: new Date().toISOString()
  });

  const newNote = {
    id: noteRef.id,
    ...data,
    createdAt: new Date().toISOString()
  };

  console.log('Created note:', newNote);
  return newNote;
}

export async function updateNote(id: string, data: Partial<Note>): Promise<void> {
  const noteRef = doc(db, COLLECTION, id);
  await updateDoc(noteRef, {
    ...data,
    updatedAt: serverTimestamp()
  });
}

export async function deleteNote(id: string): Promise<void> {
  const noteRef = doc(db, COLLECTION, id);
  await deleteDoc(noteRef);
}