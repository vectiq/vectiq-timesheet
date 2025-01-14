import { useState } from 'react';
import { format, addMonths, subMonths, startOfMonth } from 'date-fns';
import { useForecasts } from '@/lib/hooks/useForecasts';
import { useReports } from '@/lib/hooks/useReports';
import { LoadingScreen } from '@/components/ui/LoadingScreen';
import { DateNavigation } from '@/components/timesheet/DateNavigation';
import { ForecastReportSummary } from '@/components/forecast/ForecastReportSummary';
import { ForecastReportTable } from '@/components/forecast/ForecastReportTable';
import type { ReportFilters } from '@/types';

interface ForecastReportContentProps {
  filters: ReportFilters;
  onFiltersChange: (filters: ReportFilters) => void;
}

export function ForecastReportContent({ filters, onFiltersChange }: ForecastReportContentProps) {
  const [currentDate, setCurrentDate] = useState(startOfMonth(new Date(filters.startDate)));
  const currentMonth = format(currentDate, 'yyyy-MM');

  const { forecasts, isLoading: isLoadingForecasts } = useForecasts(
    currentMonth
  );
  
  const { data: reportData, isLoading: isLoadingReports } = useReports({
    startDate: format(currentDate, 'yyyy-MM-dd'),
    endDate: format(addMonths(currentDate, 1), 'yyyy-MM-dd'),
    clientIds: filters.clientIds,
    projectIds: filters.projectIds,
    roleIds: filters.roleIds,
    type: 'time'
  });

  const handlePrevious = () => setCurrentDate(subMonths(currentDate, 1));
  const handleNext = () => setCurrentDate(addMonths(currentDate, 1));
  const handleToday = () => setCurrentDate(startOfMonth(new Date()));

  if (isLoadingForecasts || isLoadingReports) {
    return <LoadingScreen />;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <DateNavigation
          currentDate={currentDate}
          onPrevious={handlePrevious}
          onNext={handleNext}
          onToday={handleToday}
          formatString="MMMM yyyy"
        />
      </div>

      <ForecastReportSummary
        forecasts={forecasts}
        actuals={reportData}
        month={currentMonth}
      />

      <ForecastReportTable
        forecasts={forecasts}
        actuals={reportData}
        month={currentMonth}
      />
    </div>
  );
}