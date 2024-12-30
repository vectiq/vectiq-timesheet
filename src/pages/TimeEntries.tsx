import { useState, useCallback, useEffect } from 'react';
import { WeeklyView } from '@/components/timesheet/WeeklyView';
import { MonthlyView } from '@/components/timesheet/MonthlyView';
import { ApprovalDialog } from '@/components/timesheet/ApprovalDialog';
import { Button } from '@/components/ui/Button';
import { DateNavigation } from '@/components/timesheet/DateNavigation';
import { LoadingScreen } from '@/components/ui/LoadingScreen';
import { useTimeEntries } from '@/lib/hooks/useTimeEntries';
import { useProjects } from '@/lib/hooks/useProjects';
import { useDateNavigation } from '@/lib/hooks/useDateNavigation';

export default function TimeEntries() {
  const [view, setView] = useState<'weekly' | 'monthly'>('weekly');
  const [isApprovalDialogOpen, setIsApprovalDialogOpen] = useState(false);
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
        <div className="flex items-center gap-4">
          <h1 className="text-2xl font-semibold text-gray-900">Timesheet</h1>
          <div className="flex rounded-lg shadow-sm">
            <Button
              variant={view === 'weekly' ? 'primary' : 'secondary'}
              className="rounded-r-none"
              onClick={() => handleViewChange('weekly')}
            >
              Weekly
            </Button>
            <Button
              variant={view === 'monthly' ? 'primary' : 'secondary'}
              className="rounded-l-none"
              onClick={() => handleViewChange('monthly')}
            >
              Monthly
            </Button>
          </div>
        </div>
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

      {view === 'weekly' ? (
        <WeeklyView
          projects={projects}
          dateRange={dateNav.dateRange}
        />
      ) : (
        <MonthlyView 
          dateRange={dateNav.dateRange}
          onApprovalClick={() => setIsApprovalDialogOpen(true)}
        />
      )}

      <ApprovalDialog
        open={isApprovalDialogOpen}
        onOpenChange={setIsApprovalDialogOpen}
        dateRange={dateNav.dateRange}
      />
    </div>
  );
}