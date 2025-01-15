import { useState, useMemo } from 'react';
import { format, addMonths, subMonths, startOfMonth, addYears, subYears } from 'date-fns';
import { useForecasts } from '@/lib/hooks/useForecasts';
import { useUsers } from '@/lib/hooks/useUsers';
import { useProjects } from '@/lib/hooks/useProjects';
import { useClients } from '@/lib/hooks/useClients';
import { useReports } from '@/lib/hooks/useReports';
import { LoadingScreen } from '@/components/ui/LoadingScreen';
import { cn } from '@/lib/utils/styles';
import { DateNavigation } from '@/components/timesheet/DateNavigation';
import { ForecastReportSummary } from '@/components/forecast/ForecastReportSummary';
import { ForecastReportTable } from '@/components/forecast/ForecastReportTable';
import { ForecastChart } from '@/components/forecast/ForecastChart';
import { Button } from '@/components/ui/Button';
import { getWorkingDaysForMonth } from '@/lib/utils/workingDays';
import type { ReportFilters } from '@/types';

const VIEW_OPTIONS = [
  { id: 'monthly', label: 'Monthly View' },
  { id: 'yearly', label: 'Financial Year' }
] as const;

interface ForecastReportContentProps {
  filters: ReportFilters;
  onFiltersChange: (filters: ReportFilters) => void;
}

export function ForecastReportContent({ filters, onFiltersChange }: ForecastReportContentProps) {
  const [view, setView] = useState<'monthly' | 'yearly'>('monthly');
  const [currentDate, setCurrentDate] = useState(startOfMonth(new Date(filters.startDate)));
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
  const { projects, isLoading: isLoadingProjects } = useProjects();
  const { clients, isLoading: isLoadingClients } = useClients();
  const { 
    forecasts,
    previousForecasts,
    isLoading: isLoadingForecasts,
  } = useForecasts(
    view === 'monthly' ? currentMonth : format(financialYearStart, 'yyyy-MM'),
    view === 'yearly'
  );
  
  const { data: reportData, isLoading: isLoadingReports } = useReports({
    startDate: format(currentDate, 'yyyy-MM-dd'),
    endDate: format(addMonths(currentDate, 1), 'yyyy-MM-dd'),
    clientIds: filters.clientIds,
    projectIds: filters.projectIds,
    roleIds: filters.roleIds,
    type: 'time'
  });

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

  if (isLoadingForecasts || isLoadingReports || isLoadingUsers || isLoadingProjects || isLoadingClients) {
    return <LoadingScreen />;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center justify-between">
        <div className="flex items-center gap-4">
          <h1 className="text-2xl font-semibold text-gray-900">Forecast Report</h1>
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

      {view === 'yearly' && (
        <ForecastChart
          startDate={financialYearStart}
          endDate={financialYearEnd}
          forecasts={forecasts}
          actuals={reportData}
          projects={projects}
          users={users}
          isYearlyView={true}
        />
      )}

      <ForecastReportSummary
        forecasts={forecasts}
        actuals={reportData}
        startDate={view === 'monthly' ? currentMonth : format(financialYearStart, 'yyyy-MM')}
        endDate={view === 'monthly' ? currentMonth : format(financialYearEnd, 'yyyy-MM')}
        users={users}
        projects={projects}
        workingDays={workingDays}
        isYearlyView={view === 'yearly'}
      />

      <ForecastReportTable
        forecasts={forecasts}
        actuals={reportData}
        startDate={view === 'monthly' ? currentMonth : format(financialYearStart, 'yyyy-MM')}
        endDate={view === 'monthly' ? currentMonth : format(financialYearEnd, 'yyyy-MM')}
        users={users}
        projects={projects}
        clients={clients}
        workingDays={workingDays}
        isYearlyView={view === 'yearly'}
      />
    </div>
  );
}