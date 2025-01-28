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
import type { Project, User } from '@/types';
import { calculateDefaultHours, getWorkingDaysForMonth } from '@/lib/utils/workingDays';
import { getCostRateForDate, getSellRateForDate } from '@/lib/utils/rates';

const COLLECTION = 'forecasts';

interface ForecastHours {
  hours: number;
  isDefault: boolean;
}

export function calculateForecastFinancials({
  hours,
  task,
  date,
  user
}: {
  hours: number;
  task?: ProjectTask;
  date?: string;
  user?: User;
}): { revenue: number; cost: number } {
  // Get sell rate for the date
  const effectiveSellRate = task?.sellRates ? getSellRateForDate(task.sellRates, date) : 0;
  
  // Get cost rate for the date
  const costRate = user ? getCostRateForDate(user.costRate, date) : 0;

  return {
    revenue: hours * effectiveSellRate,
    cost: hours * costRate
  };
}
