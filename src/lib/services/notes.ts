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
    console.log('Getting notes from Firestore:', { projectId, month });
  
    // Create two queries - one for persistent notes and one for month-specific notes
    const persistentQuery = query(
      collection(db, COLLECTION),
      where('projectId', '==', projectId),
      where('isPersistent', '==', true),
      orderBy('createdAt', 'desc')
    );
  
    const monthlyQuery = query(
      collection(db, COLLECTION),
      where('projectId', '==', projectId),
      where('isPersistent', '==', false),
      where('month', '==', month),
      orderBy('createdAt', 'desc')
    );
  
    try {
      // Get both persistent and monthly notes
      const [persistentSnapshot, monthlySnapshot] = await Promise.all([
        getDocs(persistentQuery),
        getDocs(monthlyQuery)
      ]);
  
      // Combine and sort the notes
      const persistentNotes = persistentSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
  
      const monthlyNotes = monthlySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
  
      const notes = [...persistentNotes, ...monthlyNotes].sort((a, b) => 
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      ) as Note[];
      
      console.log('Retrieved notes:', notes.length);
      return notes;
    } catch (error) {
      console.error('Error getting notes:', error);
      throw error;
    }
  }
  
  export async function createNote(data: Omit<Note, 'id' | 'createdAt'>): Promise<Note> {
    console.log('Creating note:', data);
  
    // For persistent notes, don't include the month field
    const noteData = data.isPersistent
      ? {
          ...data,
          month: null,
          createdAt: new Date().toISOString()
        }
      : {
          ...data,
          createdAt: new Date().toISOString()
        };
  
    const noteRef = await addDoc(collection(db, COLLECTION), {
      ...noteData
    });
  
    const newNote = {
      id: noteRef.id,
      ...noteData,
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