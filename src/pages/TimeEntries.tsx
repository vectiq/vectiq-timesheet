import { useState, useCallback } from 'react';
import { WeeklyView } from '@/components/timesheet/WeeklyView';
import { DateNavigation } from '@/components/timesheet/DateNavigation';
import { LoadingScreen } from '@/components/ui/LoadingScreen';
import { useTimeEntries } from '@/lib/hooks/useTimeEntries';
import { useProjects } from '@/lib/hooks/useProjects';
import { useDateNavigation } from '@/lib/hooks/useDateNavigation';

export default function TimeEntries() {
  const [view, setView] = useState<'weekly' | 'monthly'>('weekly');
  const { isLoading: isLoadingEntries } = useTimeEntries();
  const { projects, isLoading: isLoadingProjects } = useProjects();
  
  const dateNav = useDateNavigation({
    type: view === 'weekly' ? 'week' : 'month',
  });

  const handleViewChange = useCallback((newView: 'weekly' | 'monthly') => {
    setView(newView);
  }, []);

  if (isLoadingEntries || isLoadingProjects) {
    return <LoadingScreen />;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:justify-between sm:items-center">
        <h1 className="text-2xl font-semibold text-gray-900">Timesheet</h1>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
          <DateNavigation
            currentDate={dateNav.currentDate}
            onPrevious={dateNav.goToPrevious}
            onNext={dateNav.goToNext}
            onToday={dateNav.goToToday}
            formatString={view === 'weekly' ? 'MMMM d, yyyy' : 'MMMM yyyy'}
          />
        </div>
      </div>

        <WeeklyView
          projects={projects}
          dateRange={dateNav.dateRange}
        />
    </div>
  );
}