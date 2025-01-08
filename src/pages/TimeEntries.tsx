import { useState, useCallback, useEffect } from 'react';
import { WeeklyView } from '@/components/timesheet/WeeklyView';
import { MonthlyView } from '@/components/timesheet/MonthlyView';
import { UserSelect } from '@/components/timesheet/UserSelect';
import { ApprovalDialog } from '@/components/timesheet/ApprovalDialog';
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
  const [isApprovalDialogOpen, setIsApprovalDialogOpen] = useState(false);
  const [projectsWithStatus, setProjectsWithStatus] = useState<ProjectWithStatus[]>([]);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(() => {
    const savedUserId = localStorage.getItem('selectedUserId');
    return savedUserId || null;
  });
  const { currentUser, users, isLoading: isLoadingUsers } = useUsers();
  const dateNav = useDateNavigation({
    type: view === 'weekly' ? 'week' : 'month',
  });
  const { isLoading: isLoadingEntries } = useTimeEntries({ 
    userId: currentUser?.role === 'admin' ? selectedUserId : currentUser?.id,
    dateRange: dateNav.dateRange
  });
  const { projects, isLoading: isLoadingProjects } = useProjects();
  

  useEffect(() => {
    // Set initial selected user to current user
    if (currentUser && !selectedUserId) {
      setSelectedUserId(currentUser.id);
    }
  }, [currentUser, selectedUserId]);

  const handleViewChange = useCallback((newView: 'weekly' | 'monthly') => {
    setView(newView);
  }, []);

  const handleUserChange = useCallback((userId: string) => {
    localStorage.setItem('selectedUserId', userId);
    setSelectedUserId(userId);
  }, []);

  const isAdmin = currentUser?.role === 'admin';

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:justify-between sm:items-center">
        <div className="flex items-center gap-4">
          <h1 className="text-2xl font-semibold text-gray-900">Timesheet</h1>
          {isAdmin && !isLoadingUsers && (
            <UserSelect
              users={users}
              selectedUserId={selectedUserId}
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
          userId={selectedUserId}
        />
      ) : (
        <MonthlyView 
          dateRange={dateNav.dateRange}
          onApprovalClick={(projects) => {
            setProjectsWithStatus(projects);
            setIsApprovalDialogOpen(true);
          }}
        />
      )}
      
      <ApprovalDialog
        open={isApprovalDialogOpen}
        onOpenChange={setIsApprovalDialogOpen}
        dateRange={dateNav.dateRange}
        projectsWithStatus={projectsWithStatus}
      />
    </div>
  );
}