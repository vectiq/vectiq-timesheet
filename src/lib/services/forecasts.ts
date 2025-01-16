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
import { calculateDefaultHours, getWorkingDaysForMonth } from '@/lib/utils/workingDays';

// Helper function to get cost rate for a specific date
const getCostRateForDate = (user: User, date: string): number => {
  if (!user.costRate || user.costRate.length === 0) return 0;
  
  // Sort cost rates by date descending
  const sortedRates = [...user.costRate].sort((a, b) => 
    new Date(b.date).getTime() - new Date(a.date).getTime()
  );
  
  // Find the first rate that is less than or equal to the entry date
  const applicableRate = sortedRates.find(rate => 
    new Date(rate.date) <= new Date(date)
  );
  
  return applicableRate?.costRate || 0;
};

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
  date,
  user
}: {
  hours: number;
  taskRate?: number;
  date?: string;
  user?: User;
}): { revenue: number; cost: number } {
  // Only use task rate for revenue
  const sellRate = taskRate || 0;
  
  // For cost rate, use task's cost rate if available
  let costRate = user?.costRate ? getCostRateForDate(user, date) : 0;

  return {
    revenue: hours * sellRate,
    cost: hours * costRate
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