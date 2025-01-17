import { useQuery } from '@tanstack/react-query';
import { format } from 'date-fns';
import { getPayRun, getPayRunHistory, getPayRunStats, getPayrollCalendars } from '@/lib/services/payroll';
import type { PayRun, PayrollCalendar } from '@/types';

const QUERY_KEYS = {
  payRun: 'payRun',
  history: 'payRunHistory',
  stats: 'payRunStats',
  calendars: 'payrollCalendars'
} as const;

interface UsePayrollOptions {
  selectedDate: Date;
  includeHistory?: boolean;
  includeStats?: boolean;
}

export function usePayroll({ 
  selectedDate,
  includeHistory = false,
  includeStats = false
}: UsePayrollOptions) {
  // Format the month as YYYYMM for querying
  const month = format(selectedDate, 'yyyyMM');

  // Query for current month's pay runs
  const payRunQuery = useQuery({
    queryKey: [QUERY_KEYS.payRun, month],
    queryFn: () => getPayRun(month)
  });

  // Query for pay run history (optional)
  const historyQuery = useQuery({
    queryKey: [QUERY_KEYS.history],
    queryFn: () => getPayRunHistory(),
    enabled: includeHistory
  });

  // Query for pay run stats (optional)
  const statsQuery = useQuery({
    queryKey: [QUERY_KEYS.stats, month],
    queryFn: () => getPayRunStats(month),
    enabled: includeStats
  });

  // Query for payroll calendars
  const calendarsQuery = useQuery({
    queryKey: [QUERY_KEYS.calendars],
    queryFn: getPayrollCalendars
  });

  // Get the latest pay run for the month
  const latestPayRun = payRunQuery.data?.length 
    ? payRunQuery.data.reduce((latest, current) => {
        const latestDate = new Date(latest.UpdatedDateUTC);
        const currentDate = new Date(current.UpdatedDateUTC);
        return currentDate > latestDate ? current : latest;
      })
    : null;

  return {
    payRun: latestPayRun,
    payRuns: payRunQuery.data || [],
    history: historyQuery.data,
    stats: statsQuery.data,
    calendars: calendarsQuery.data || [],
    isLoading: payRunQuery.isLoading || 
      (includeHistory && historyQuery.isLoading) || 
      (includeStats && statsQuery.isLoading) ||
      calendarsQuery.isLoading,
    error: payRunQuery.error || historyQuery.error || statsQuery.error || calendarsQuery.error
  };
}