import { useState } from 'react';
import { format, addMonths, subMonths, startOfMonth } from 'date-fns';
import { useForecasts } from '@/lib/hooks/useForecasts';
import { useUsers } from '@/lib/hooks/useUsers';
import { useProjects } from '@/lib/hooks/useProjects';
import { useClients } from '@/lib/hooks/useClients';
import { ForecastTable } from '@/components/forecast/ForecastTable';
import { DateNavigation } from '@/components/timesheet/DateNavigation';
import { LoadingScreen } from '@/components/ui/LoadingScreen';
import { getWorkingDaysForMonth, calculateDefaultHours } from '@/lib/utils/workingDays';

export default function Forecast() {
  const [currentDate, setCurrentDate] = useState(startOfMonth(new Date()));
  const currentMonth = format(currentDate, 'yyyy-MM');
  
  const { users, isLoading: isLoadingUsers } = useUsers();
  const { projects, isLoading: isLoadingProjects } = useProjects();
  const { clients, isLoading: isLoadingClients } = useClients();
  const { 
    forecasts,
    isLoading: isLoadingForecasts,
    createForecast,
    updateForecast
  } = useForecasts(currentMonth);

  const handlePrevious = () => setCurrentDate(subMonths(currentDate, 1));
  const handleNext = () => setCurrentDate(addMonths(currentDate, 1));
  const handleToday = () => setCurrentDate(startOfMonth(new Date()));

  const workingDays = getWorkingDaysForMonth(currentMonth);

  if (isLoadingUsers || isLoadingProjects || isLoadingForecasts || isLoadingClients) {
    return <LoadingScreen />;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:justify-between sm:items-center">
        <h1 className="text-2xl font-semibold text-gray-900">Forecast</h1>
        <DateNavigation
          currentDate={currentDate}
          onPrevious={handlePrevious}
          onNext={handleNext}
          onToday={handleToday}
          formatString="MMMM yyyy"
        />
      </div>

      <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-md">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-yellow-800">Working Days Information</h3>
            <div className="mt-2 text-sm text-yellow-700">
              <p>This month has {workingDays} working days (excluding weekends and public holidays).</p>
              <p className="mt-1">Default values are calculated based on each user's standard working hours.</p>
            </div>
          </div>
        </div>
      </div>

      <ForecastTable
        month={currentMonth}
        workingDays={workingDays}
        clients={clients}
        users={users}
        projects={projects}
        forecasts={forecasts}
        onCreateForecast={createForecast}
        onUpdateForecast={updateForecast}
      />
    </div>
  );
}