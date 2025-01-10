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
  
    const q = query(
      collection(db, COLLECTION),
      where('projectId', '==', projectId),
      where('month', '==', month),
      orderBy('createdAt', 'desc')
    );
  
    try {
      const snapshot = await getDocs(q);
      const notes = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Note[];
      
      console.log('Retrieved notes:', notes.length);
      return notes;
    } catch (error) {
      console.error('Error getting notes:', error);
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