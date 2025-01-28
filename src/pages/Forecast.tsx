import { useState, useMemo } from 'react';
import { format, addMonths, subMonths, startOfMonth, addYears, subYears } from 'date-fns';
import { useUsers } from '@/lib/hooks/useUsers';
import { useProjects } from '@/lib/hooks/useProjects';
import { useClients } from '@/lib/hooks/useClients';
import { LoadingScreen } from '@/components/ui/LoadingScreen';
import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/utils/styles';
import { UserForecastTable } from '@/components/forecast/UserForecastTable';
import { WorkingDaysPanel } from '@/components/forecast/WorkingDaysPanel';
import { DateNavigation } from '@/components/timesheet/DateNavigation';
import { ForecastSummaryCard } from '@/components/forecast/ForecastSummaryCard';
import { usePublicHolidays } from '@/lib/hooks/usePublicHolidays';
import { useBonuses } from '@/lib/hooks/useBonuses';
import { getWorkingDaysForMonth } from '@/lib/utils/workingDays';

const VIEW_OPTIONS = [
  { id: 'monthly', label: 'Monthly View' },
  { id: 'yearly', label: 'Financial Year' }
] as const;

export default function Forecast() {
  const [view, setView] = useState<'monthly' | 'yearly'>('monthly');
  const [currentDate, setCurrentDate] = useState(startOfMonth(new Date()));
  const currentMonth = format(currentDate, 'yyyy-MM');
  const workingDays = getWorkingDaysForMonth(currentMonth);

  // Get financial year dates
  const financialYearStart = useMemo(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    // If before July, use previous year as start
    const fyStartYear = month < 6 ? year - 1 : year;
    return new Date(fyStartYear, 6, 1); // July 1st
  }, [currentDate]);

  const financialYearEnd = useMemo(() => {
    return new Date(financialYearStart.getFullYear() + 1, 5, 30); // June 30th
  }, [financialYearStart]);

  const { users, isLoading: isLoadingUsers } = useUsers();
  const { projects: allProjects, isLoading: isLoadingProjects } = useProjects();
  const { clients, isLoading: isLoadingClients } = useClients();
  const { holidays } = usePublicHolidays(currentMonth);
  const { bonuses } = useBonuses(currentMonth);


  // Filter for active projects only
  const projects = useMemo(() => {
    return allProjects.filter(project => {
      // Get first day of selected month
      const selectedDate = new Date(currentMonth + '-01');
      selectedDate.setHours(0, 0, 0, 0);

      const isActive = project.isActive;
      const hasEndDate = project.endDate && project.endDate.trim().length === 10;
      const endDate = hasEndDate ? new Date(project.endDate + 'T23:59:59') : null;
      const isEndDateValid = endDate ? endDate >= selectedDate : true;
      
      return isActive && (!hasEndDate || isEndDateValid);
    });
  }, [allProjects, currentMonth]);

  const handlePrevious = () => {
    if (view === 'monthly') {
      setCurrentDate(subMonths(currentDate, 1));
    } else {
      setCurrentDate(subYears(currentDate, 1));
    }
  };

  const handleNext = () => {
    if (view === 'monthly') {
      setCurrentDate(addMonths(currentDate, 1));
    } else {
      setCurrentDate(addYears(currentDate, 1));
    }
  };

  const handleToday = () => setCurrentDate(startOfMonth(new Date()));

  if (isLoadingUsers || isLoadingProjects || isLoadingClients) {
    return <LoadingScreen />;
  }

  const forecasts = [];

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center justify-between">
        <div className="flex items-center gap-4">
          <h1 className="text-2xl font-semibold text-gray-900">Forecast</h1>
          <div className="flex rounded-lg shadow-sm">
            {VIEW_OPTIONS.map(option => (
              <Button
                key={option.id}
                variant={view === option.id ? 'primary' : 'secondary'}
                className={cn(
                  option.id === 'monthly' && 'rounded-r-none',
                  option.id === 'yearly' && 'rounded-l-none'
                )}
                onClick={() => setView(option.id)}
              >
                {option.label}
              </Button>
            ))}
          </div>
        </div>
        <div>
          <DateNavigation
            currentDate={currentDate}
            onPrevious={handlePrevious}
            onNext={handleNext}
            onToday={handleToday}
            formatString={view === 'monthly' ? 'MMMM yyyy' : `FY${format(financialYearStart, 'yy')}/${format(financialYearEnd, 'yy')}`}
          />
        </div>
      </div>

      <ForecastSummaryCard
        users={users}
        projects={projects}
        forecasts={forecasts}
        month={currentMonth}
        workingDays={workingDays}
        holidays={holidays}
        bonuses={bonuses}
      />

      <WorkingDaysPanel selectedDate={currentDate} />

      <div className="bg-white shadow-sm ring-1 ring-gray-900/5 rounded-lg">
        <UserForecastTable
          users={users}
          projects={projects}
          forecasts={forecasts}
          month={currentMonth}
          workingDays={workingDays}
        />
      </div>
    </div>
  );
}