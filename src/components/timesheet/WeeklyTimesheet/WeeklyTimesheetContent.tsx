import { WeeklyTimesheetHeader } from './WeeklyTimesheetHeader';
import { WeeklyTimesheetBody } from './WeeklyTimesheetBody';
import { WeeklyTimesheetFooter } from './WeeklyTimesheetFooter';
import { useWeeklyTimesheetContext } from './WeeklyTimesheetContext';
import type { Project, TimeEntry } from '@/types';

interface WeeklyTimesheetContentProps {
  projects: Project[];
  timeEntries: TimeEntry[];
}

export function WeeklyTimesheetContent({ projects, timeEntries }: WeeklyTimesheetContentProps) {
  const { weekDates } = useWeeklyTimesheetContext();

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-lg shadow">
        <div className="overflow-hidden">
          <div className="min-w-full border-b border-gray-200">
            <WeeklyTimesheetHeader dates={weekDates} />
            <WeeklyTimesheetBody projects={projects} timeEntries={timeEntries} />
          </div>
        </div>
        <WeeklyTimesheetFooter />
      </div>
    </div>
  );
}