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
import type { ForecastEntry, Project, User } from '@/types';
import { calculateDefaultHours } from '@/lib/utils/workingDays';

const COLLECTION = 'forecasts';

interface ForecastHours {
  hours: number;
  isDefault: boolean;
}

export function calculateForecastHours({
  forecasts,
  userId,
  projectId,
  taskId,
  workingDays,
  hoursPerWeek,
  isYearlyView = false
}: {
  forecasts: ForecastEntry[];
  userId: string;
  projectId: string;
  taskId: string;
  workingDays: number;
  hoursPerWeek: number;
  isYearlyView?: boolean;
}): ForecastHours {
  const forecast = forecasts.find(f => 
    f.userId === userId && 
    f.projectId === projectId && 
    f.taskId === taskId
  );
  
  if (forecast) {
    return { hours: forecast.hours, isDefault: false };
  }
  
  const defaultHours = calculateDefaultHours(workingDays, hoursPerWeek);
  const hours = isYearlyView ? defaultHours * 12 : defaultHours;
  return { hours, isDefault: true };
}

export function calculateForecastFinancials({
  hours,
  taskRate,
  userRate
}: {
  hours: number;
  taskRate?: number;
  userRate?: number;
}): { revenue: number; cost: number } {
  const rate = (taskRate && taskRate !== 0) ? taskRate : (userRate || 0);
  return {
    revenue: hours * rate,
    cost: hours * rate
  };
}

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