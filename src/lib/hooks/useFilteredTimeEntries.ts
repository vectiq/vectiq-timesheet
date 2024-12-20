import { useMemo } from 'react';
import { isWithinInterval, parseISO } from 'date-fns';
import type { TimeEntry } from '@/types';

interface UseFilteredTimeEntriesProps {
  timeEntries: TimeEntry[];
  dateRange: {
    start: Date;
    end: Date;
  };
}

export function useFilteredTimeEntries({ timeEntries, dateRange }: UseFilteredTimeEntriesProps) {
  return useMemo(() => {
    return timeEntries.filter(entry => {
      const entryDate = parseISO(entry.date);
      return isWithinInterval(entryDate, {
        start: dateRange.start,
        end: dateRange.end,
      });
    }).sort((a, b) => a.date.localeCompare(b.date));
  }, [timeEntries, dateRange]);
}