import type { SellRate, CostRate } from '@/types';

// Helper function to get sell rate for a specific date
export function getSellRateForDate(sellRates: SellRate[] | undefined, date: string): number {
  if (!sellRates || sellRates.length === 0) return 0;
  
  // Sort rates by date descending
  const sortedRates = [...sellRates].sort((a, b) => 
    new Date(b.date).getTime() - new Date(a.date).getTime()
  );
  
  // Find the first rate that is less than or equal to the entry date
  const applicableRate = sortedRates.find(rate => 
    new Date(rate.date) <= new Date(date)
  );
  
  return applicableRate?.sellRate || 0;
}

// Helper function to get cost rate for a specific date
export function getCostRateForDate(costRates: CostRate[] | undefined, date: string): number {
  if (!costRates || costRates.length === 0) return 0;
  
  // Sort rates by date descending
  const sortedRates = [...costRates].sort((a, b) => 
    new Date(b.date).getTime() - new Date(a.date).getTime()
  );
  
  // Find the first rate that is less than or equal to the entry date
  const applicableRate = sortedRates.find(rate => 
    new Date(rate.date) <= new Date(date)
  );
  
  return applicableRate?.costRate || 0;
}

// Helper function to get cost rate for the first day of a month
export function getCostRateForMonth(costRates: CostRate[] | undefined, month: string): number {
  if (!costRates || costRates.length === 0) return 0;
  
  // Convert month string (YYYY-MM) to first day of month
  const monthStart = new Date(month + '-01');
  
  // Sort rates by date descending
  const sortedRates = [...costRates].sort((a, b) => 
    new Date(b.date).getTime() - new Date(a.date).getTime()
  );
  
  // Find the first rate that is less than or equal to the start of the month
  const applicableRate = sortedRates.find(rate => 
    new Date(rate.date) <= monthStart
  );
  
  return applicableRate?.costRate || 0;
}