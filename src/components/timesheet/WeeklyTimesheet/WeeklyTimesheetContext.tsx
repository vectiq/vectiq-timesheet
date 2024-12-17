import { createContext, useContext, ReactNode } from 'react';
import { useWeeklyTimesheet } from '@/lib/hooks/useWeeklyTimesheet';

const WeeklyTimesheetContext = createContext<ReturnType<typeof useWeeklyTimesheet> | null>(null);

export function WeeklyTimesheetProvider({ children }: { children: ReactNode }) {
  const timesheet = useWeeklyTimesheet();

  return (
    <WeeklyTimesheetContext.Provider value={timesheet}>
      {children}
    </WeeklyTimesheetContext.Provider>
  );
}

export function useWeeklyTimesheetContext() {
  const context = useContext(WeeklyTimesheetContext);
  if (!context) {
    throw new Error('useWeeklyTimesheet must be used within a WeeklyTimesheetProvider');
  }
  return context;
}