import { useState, useCallback } from 'react';
import { WeeklyView } from '@/components/timesheet/WeeklyView';
import { MonthlyView } from '@/components/timesheet/MonthlyView';
import { UserSelect } from '@/components/timesheet/UserSelect';
import { Button } from '@/components/ui/Button';
import { DateNavigation } from '@/components/timesheet/DateNavigation';
import { LoadingScreen } from '@/components/ui/LoadingScreen';
import { useTimeEntries } from '@/lib/hooks/useTimeEntries';
import { useProjects } from '@/lib/hooks/useProjects';
import { useUsers } from '@/lib/hooks/useUsers';
import { useDateNavigation } from '@/lib/hooks/useDateNavigation';
import { auth } from '@/lib/firebase';

export default function TimeEntries() {
  const [view, setView] = useState<'weekly' | 'monthly'>('weekly');
  const { 
    currentUser, 
    effectiveUser, 
    setEffectiveUser, 
    resetEffectiveUser,
    isAdmin, 
    users, 
    isLoading: isLoadingUsers 
  } = useUsers();

  const dateNav = useDateNavigation({
    type: view === 'weekly' ? 'week' : 'month',
  });
  const { isLoading: isLoadingEntries } = useTimeEntries({ 
    // userId: effectiveUser?.id,
    dateRange: dateNav.dateRange
  });
  const { projects, isLoading: isLoadingProjects } = useProjects();
  

  const handleViewChange = useCallback((newView: 'weekly' | 'monthly') => {
    setView(newView);
  }, []);

  const handleUserChange = useCallback((userId: string) => {
    const user = users.find(u => u.id === userId);
    if (user) {
      // Reset to current user if selecting self 
      if (user.id === currentUser?.id) {
        resetEffectiveUser();
      } else {
        setEffectiveUser(user);
      }
    }
  }, [users, setEffectiveUser]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:justify-between sm:items-center">
        <div className="flex items-center gap-4">
          <h1 className="text-2xl font-semibold text-gray-900">Timesheet</h1>
          {isAdmin && !isLoadingUsers && (
            <UserSelect
              users={users}
              selectedUserId={effectiveUser?.id}
              onChange={handleUserChange}
            />
          )}
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
          userId={effectiveUser?.id}
        />
      ) : (
        <MonthlyView 
          dateRange={dateNav.dateRange}
          userId={effectiveUser?.id}
        />
      )}

    </div>
  );
}