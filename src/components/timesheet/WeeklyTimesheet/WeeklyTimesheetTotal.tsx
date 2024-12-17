import { useMemo } from 'react';
import { useWeeklyTimesheet } from './WeeklyTimesheetContext';

export function WeeklyTimesheetTotal() {
  const { projectHours } = useWeeklyTimesheet();

  const totalWeeklyHours = useMemo(() => {
    return Object.values(projectHours)
      .reduce((sum, projectHours) => {
        return sum + Object.values(projectHours)
          .reduce((rowSum, value) => rowSum + (parseFloat(value) || 0), 0);
      }, 0)
      .toFixed(2);
  }, [projectHours]);

  return (
    <div className="flex justify-end items-center text-sm">
      <span className="font-medium text-gray-700">Weekly Total:</span>
      <span className="ml-2 font-semibold text-gray-900">{totalWeeklyHours} hours</span>
    </div>
  );
}