// Helper function to get sell rate for a specific date
export function getSellRateForDate(sellRates: SellRate[], date: string): number {
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