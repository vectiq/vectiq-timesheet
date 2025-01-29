import { useState, useMemo } from 'react';
import { format, addMonths, subMonths, startOfMonth, addYears, subYears } from 'date-fns';
import { useUsers } from '@/lib/hooks/useUsers';
import { useProjects } from '@/lib/hooks/useProjects';
import { useForecasts } from '@/lib/hooks/useForecasts';
import { LoadingScreen } from '@/components/ui/LoadingScreen';
import { Button } from '@/components/ui/Button';
import { Select, SelectTrigger, SelectContent, SelectItem } from '@/components/ui/Select';
import { SaveForecastDialog } from '@/components/forecast/SaveForecastDialog';
import { cn } from '@/lib/utils/styles';
import { UserForecastTable } from '@/components/forecast/UserForecastTable';
import { WorkingDaysPanel } from '@/components/forecast/WorkingDaysPanel';
import { DateNavigation } from '@/components/timesheet/DateNavigation';
import { ForecastSummaryCard } from '@/components/forecast/ForecastSummaryCard';
import { usePublicHolidays } from '@/lib/hooks/usePublicHolidays';
import { useBonuses } from '@/lib/hooks/useBonuses';
import { useLeaveForecasts } from '@/lib/hooks/useLeaveForecasts';
import { getWorkingDaysForMonth } from '@/lib/utils/workingDays';
import { getAverageSellRate, getCostRateForMonth } from '@/lib/utils/rates';
import { Save, Plus, Trash2 } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogAction,
  AlertDialogCancel,
} from '@/components/ui/AlertDialog';

const VIEW_OPTIONS = [
  { id: 'monthly', label: 'Monthly View' },
  { id: 'yearly', label: 'Financial Year' }
] as const;

export default function Forecast() {
  const [view, setView] = useState<'monthly' | 'yearly'>('monthly');
  const [currentDate, setCurrentDate] = useState(startOfMonth(new Date()));
  const [selectedForecastId, setSelectedForecastId] = useState<string>('');
  const [isNewForecastDialogOpen, setIsNewForecastDialogOpen] = useState(false);
  const [deleteConfirmation, setDeleteConfirmation] = useState<{ isOpen: boolean; forecastId: string | null }>({
    isOpen: false,
    forecastId: null
  });
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
  const { holidays } = usePublicHolidays(currentMonth);
  const { leaveData } = useLeaveForecasts(currentMonth);
  const { bonuses } = useBonuses(currentMonth);

  const { 
    forecasts: savedForecasts, 
    saveForecast, 
    updateForecast,
    deleteForecast,
    isSaving,
    isDeleting,
    isLoading: isLoadingForecasts 
  } = useForecasts({ month: currentMonth });

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

  const handleSaveForecast = async (name: string) => {
    const forecastEntries = users.map(user => {
      const averageSellRate = getAverageSellRate(projects, user.id, currentMonth + '-01');
      const totalBonuses = bonuses
        .filter(bonus => bonus.employeeId === user.id)
        .reduce((sum, bonus) => sum + bonus.amount, 0);
      const costRate = getCostRateForMonth(user.costRate || [], currentMonth);
      const plannedLeave = leaveData?.leave
        ?.filter(leave => leave.employeeId === user.xeroEmployeeId && leave.status === 'SCHEDULED')
        ?.reduce((sum, leave) => sum + leave.numberOfUnits, 0) || 0;

      return {
        userId: user.id,
        hoursPerWeek: user.hoursPerWeek || 40,
        billablePercentage: user.estimatedBillablePercentage || 0,
        forecastHours: (user.hoursPerWeek || 40) * (workingDays / 5),
        sellRate: averageSellRate,
        costRate: costRate,
        plannedBonus: totalBonuses,
        plannedLeave: plannedLeave,
        publicHolidays: holidays.length * 8
      };
    });

    await saveForecast(name, forecastEntries);
  };

  const handleSaveCurrentForecast = async () => {
    if (!selectedForecastId) return;
    
    const currentForecast = savedForecasts.find(f => f.id === selectedForecastId);
    if (!currentForecast) return;

    const forecastEntries = users.map(user => {
      const averageSellRate = getAverageSellRate(projects, user.id, currentMonth + '-01');
      const costRate = getCostRateForMonth(user.costRate || [], currentMonth);

      return {
        userId: user.id,
        hoursPerWeek: user.hoursPerWeek || 40,
        billablePercentage: user.estimatedBillablePercentage || 0,
        forecastHours: (user.hoursPerWeek || 40) * (workingDays / 5),
        sellRate: averageSellRate,
        costRate: costRate,
        plannedBonus: 0,
        plannedLeave: 0,
        publicHolidays: holidays.length * 8
      };
    });

    await updateForecast(selectedForecastId, forecastEntries);
  };

  const handleDeleteForecast = async () => {
    if (!deleteConfirmation.forecastId) return;
    
    try {
      await deleteForecast(deleteConfirmation.forecastId);
      setSelectedForecastId('');
    } catch (error) {
      console.error('Failed to delete forecast:', error);
      alert('Failed to delete forecast');
    }
    setDeleteConfirmation({ isOpen: false, forecastId: null });
  };

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

  if (isLoadingUsers || isLoadingProjects || isLoadingForecasts) {
    return <LoadingScreen />;
  }

  const forecasts = [];

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center justify-between">
        <div className="flex items-center gap-3">
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
        <div className="flex items-center gap-3">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => setIsNewForecastDialogOpen(true)}
            className="p-1.5"
            title="Create New Forecast"
          >
            <Plus className="h-4 w-4" />
          </Button>

          <Select
            value={selectedForecastId}
            onValueChange={setSelectedForecastId}
          >
            <SelectTrigger className="w-[250px]">
              {selectedForecastId ? 
                savedForecasts.find(f => f.id === selectedForecastId)?.name : 
                'Select Saved Forecast'}
            </SelectTrigger>
            <SelectContent>
              {savedForecasts.map(forecast => (
                <SelectItem key={forecast.id} value={forecast.id}>
                  {forecast.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Button
            variant="secondary"
            size="sm"
            disabled={!selectedForecastId}
            className="p-1.5"
            title="Save Current Forecast"
            onClick={handleSaveCurrentForecast}
          >
            <Save className="h-4 w-4" />
          </Button>

          {selectedForecastId && (
            <Button
              variant="secondary"
              size="sm"
              className="p-1.5 text-red-500 hover:text-red-600"
              title="Delete Current Forecast"
              onClick={() => setDeleteConfirmation({ 
                isOpen: true, 
                forecastId: selectedForecastId 
              })}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          )}

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
          selectedForecast={savedForecasts.find(f => f.id === selectedForecastId)}
          onForecastChange={(entries) => {
            if (selectedForecastId) {
              updateForecast(selectedForecastId, entries);
            }
          }}
          month={currentMonth}
          workingDays={workingDays}
        />
      </div>

      <SaveForecastDialog
        open={isNewForecastDialogOpen}
        onOpenChange={setIsNewForecastDialogOpen}
        onSave={handleSaveForecast}
        isLoading={isSaving}
      />
      
      <AlertDialog 
        open={deleteConfirmation.isOpen} 
        onOpenChange={(open) => setDeleteConfirmation(prev => ({ ...prev, isOpen: open }))}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Forecast</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this forecast? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDeleteForecast}
              className="bg-red-600 hover:bg-red-700 focus:ring-red-600"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}