import { WeeklyTimesheetProvider } from './WeeklyTimesheetContext';
import { WeeklyTimesheetContent } from './WeeklyTimesheetContent';
import type { Project, TimeEntry } from '@/types';

interface WeeklyTimesheetProps {
  projects: Project[];
  timeEntries: TimeEntry[];
}

export function WeeklyTimesheet({ projects, timeEntries }: WeeklyTimesheetProps) {
  return (
    <WeeklyTimesheetProvider>
      <WeeklyTimesheetContent projects={projects} timeEntries={timeEntries} />
    </WeeklyTimesheetProvider>
  );
}