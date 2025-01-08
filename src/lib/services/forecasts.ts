import {
    collection,
    doc,
    getDocs,
    setDoc,
    query,
    where,
    serverTimestamp,
  } from 'firebase/firestore';
  import { db } from '@/lib/firebase';
  import { format } from 'date-fns';
  import type { ForecastEntry } from '@/types';
  
  const COLLECTION = 'forecasts';
  
  export async function getForecastEntries(month: string): Promise<ForecastEntry[]> {
    const q = query(
      collection(db, COLLECTION),
      where('month', '==', month)
    );
    
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as ForecastEntry[];
  }
  
  export async function saveForecastEntry(entry: Omit<ForecastEntry, 'id'>): Promise<ForecastEntry> {
    const forecastRef = doc(collection(db, COLLECTION));
    const forecast: ForecastEntry = {
      id: forecastRef.id,
      ...entry,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };
    
    await setDoc(forecastRef, forecast);
    return forecast;
  }
  
  export async function updateForecastEntry(id: string, hours: number): Promise<void> {
    const forecastRef = doc(db, COLLECTION, id);
    await setDoc(forecastRef, {
      hours,
      updatedAt: serverTimestamp()
    }, { merge: true });
  }