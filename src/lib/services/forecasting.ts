import { addMonths, format, parseISO } from 'date-fns';
import type { ForecastEntry, ProjectForecast, WorkingDays } from '@/types/forecasting';

// Dummy data for holidays in Canberra
const CANBERRA_HOLIDAYS_2024 = [
  { date: '2024-01-01', name: 'New Year\'s Day' },
  { date: '2024-01-26', name: 'Australia Day' },
  { date: '2024-03-11', name: 'Canberra Day' },
  { date: '2024-03-29', name: 'Good Friday' },
  { date: '2024-04-25', name: 'ANZAC Day' },
  { date: '2024-05-27', name: 'Reconciliation Day' },
  { date: '2024-06-10', name: 'King\'s Birthday' },
  { date: '2024-10-07', name: 'Labour Day' },
  { date: '2024-12-25', name: 'Christmas Day' },
  { date: '2024-12-26', name: 'Boxing Day' },
];

// Dummy data generator for forecasts
export function generateDummyForecasts(
  startMonth: string,
  months: number = 6
): ProjectForecast[] {
  const forecasts: ProjectForecast[] = [];
  
  for (let i = 0; i < months; i++) {
    const date = parseISO(startMonth + '-01');
    const month = format(addMonths(date, i), 'yyyy-MM');
    const variance = Math.random() * 20 - 10; // Random variance between -10% and +10%
    
    forecasts.push({
      id: crypto.randomUUID(),
      projectId: 'project1',
      month,
      totalForecastedHours: 160,
      totalActualHours: 160 * (1 + variance / 100),
      totalForecastedCost: 16000,
      totalActualCost: 16000 * (1 + variance / 100),
      totalForecastedRevenue: 32000,
      totalActualRevenue: 32000 * (1 + variance / 100),
      grossMargin: 50,
      actualGrossMargin: 50 * (1 + variance / 100),
      variance: {
        hours: variance,
        cost: variance,
        revenue: variance,
        grossMargin: variance
      }
    });
  }
  
  return forecasts;
}

export function getWorkingDays(month: string): WorkingDays {
  // Dummy implementation - replace with actual calculation
  return {
    month,
    totalDays: 30,
    workingDays: 22,
    holidays: CANBERRA_HOLIDAYS_2024.filter(h => h.date.startsWith(month))
  };
}