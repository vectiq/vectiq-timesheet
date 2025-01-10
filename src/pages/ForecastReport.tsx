import { useState, useMemo } from 'react';
import { format, startOfYear, endOfYear, eachMonthOfInterval, isBefore, isAfter } from 'date-fns';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useProjects } from '@/lib/hooks/useProjects';
import { useUsers } from '@/lib/hooks/useUsers';
import { useForecasts } from '@/lib/hooks/useForecasts';
import { useTimeEntries } from '@/lib/hooks/useTimeEntries';
import { LoadingScreen } from '@/components/ui/LoadingScreen';
import { formatCurrency } from '@/lib/utils/currency';
import { getWorkingDaysForMonth, calculateDefaultHours } from '@/lib/utils/workingDays';
import {
  ResponsiveContainer,
  ComposedChart,
  Line,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';

export default function ForecastReport() {
  // Get current financial year
  const currentDate = new Date();
  const currentMonth = currentDate.getMonth();
  const defaultYear = currentMonth >= 6 ? currentDate.getFullYear() : currentDate.getFullYear() - 1;
  const [selectedYear, setSelectedYear] = useState(defaultYear);

  // Financial year runs July 1 to June 30
  const yearStart = new Date(selectedYear, 6, 1); // July 1
  const yearEnd = new Date(selectedYear + 1, 5, 30); // June 30

  const { projects, isLoading: isLoadingProjects } = useProjects();
  const { users, isLoading: isLoadingUsers } = useUsers();

  // Get all months in the year
  const months = eachMonthOfInterval({ start: yearStart, end: yearEnd });

  // Get timesheet entries for the year
  const { timeEntries, isLoading: isLoadingEntries } = useTimeEntries({
    dateRange: {
      start: yearStart,
      end: yearEnd
    }
  });

  // Get forecast data for each month
  const monthlyForecasts = months.map(month => {
    const monthStr = format(month, 'yyyy-MM');
    const { forecasts, isLoading } = useForecasts(monthStr);
    return { month: monthStr, data: forecasts, isLoading };
  });

  const isLoading = isLoadingEntries || isLoadingProjects || monthlyForecasts.some(m => m.isLoading);

  // Combine actual and forecast data
  const chartData = useMemo(() => {
    if (!timeEntries || !projects) return [];

    return months.map(month => {
      const monthStr = format(month, 'yyyy-MM');
      const isMonthInPast = isBefore(month, currentDate);
      const isCurrentMonth = format(month, 'yyyy-MM') === format(currentDate, 'yyyy-MM');
      const workingDays = getWorkingDaysForMonth(monthStr);
      
      // Get forecast data for the month
      const monthForecast = monthlyForecasts.find(f => f.month === monthStr)?.data || [];
      let forecastRevenue = 0;
      let forecastCosts = 0;
      
      // Process each user's project assignments
      users.forEach(user => {
        user.projectAssignments?.forEach(assignment => {
          const project = projects.find(p => p.id === assignment.projectId);
          const projectTask = project?.tasks?.find(r => r.id === assignment.taskId);
          
          if (!project || !projectTask) return;
          
          // Find explicit forecast entry or use default hours
          const forecast = monthForecast.find(f => 
            f.userId === user.id && 
            f.projectId === project.id && 
            f.taskId === projectTask.id
          );
          
          const hours = forecast?.hours ?? calculateDefaultHours(workingDays, user.hoursPerWeek || 40);
          
          // Use project task rates if available, otherwise fall back to user rates
          const sellRate = projectTask.sellRate || user.sellRate || 0;
          const costRate = projectTask.costRate || user.costRate || 0;
          
          forecastRevenue += hours * sellRate;
          forecastCosts += hours * costRate;
        });
      });


      // For past months, use actual data
      const monthActuals = isMonthInPast || isCurrentMonth ? {
        actualRevenue: 0,
        actualCosts: 0,
        actualMargin: 0
      } : {
        actualRevenue: null,
        actualCosts: null,
        actualMargin: null
      };

      // Calculate actuals from entries
      if (isMonthInPast || isCurrentMonth) {
        timeEntries.forEach(entry => {
          // Only include entries for current month
          if (format(new Date(entry.date), 'yyyy-MM') !== monthStr) return;
          
          const project = projects.find(p => p.id === entry.projectId);
          const projectTask = project?.tasks?.find(r => r.id === entry.taskId);
          const user = users.find(u => u.id === entry.userId);
          
          const sellRate = projectTask?.sellRate || user?.sellRate || 0;
          const costRate = projectTask?.costRate || user?.costRate || 0;
          
          monthActuals.actualRevenue += entry.hours * sellRate;
          monthActuals.actualCosts += entry.hours * costRate;
        });
        
        monthActuals.actualMargin = monthActuals.actualRevenue > 0 
          ? ((monthActuals.actualRevenue - monthActuals.actualCosts) / monthActuals.actualRevenue) * 100 
          : 0;
      }

      return {
        month: format(month, 'MMM'),
        forecastRevenue,
        forecastCosts,
        forecastMargin: forecastRevenue > 0 ? ((forecastRevenue - forecastCosts) / forecastRevenue) * 100 : 0,
        ...monthActuals
      };
    });
  }, [months, currentDate, monthlyForecasts, timeEntries, projects, users]);


  // Calculate yearly totals
  const yearlyTotals = useMemo(() => {
    return chartData.reduce((acc, month) => ({
      forecastRevenue: acc.forecastRevenue + (month.forecastRevenue || 0),
      forecastCosts: acc.forecastCosts + (month.forecastCosts || 0),
      actualRevenue: acc.actualRevenue + (month.actualRevenue || 0),
      actualCosts: acc.actualCosts + (month.actualCosts || 0),
    }), {
      forecastRevenue: 0,
      forecastCosts: 0,
      actualRevenue: 0,
      actualCosts: 0,
    });
  }, [chartData]);

  if (isLoading) {
    return <LoadingScreen />;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold text-gray-900">Forecast Report</h1>
        <div className="flex items-center gap-2">
          <span className="text-lg font-medium">FY</span>
          <Button
            variant="secondary"
            onClick={() => setSelectedYear(prev => prev - 1)}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="text-lg font-medium px-4">{selectedYear}/{(selectedYear + 1).toString().slice(2)}</span>
          <Button
            variant="secondary"
            onClick={() => setSelectedYear(prev => prev + 1)}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="p-6">
          <h3 className="text-sm font-medium text-gray-500">Forecast Revenue</h3>
          <p className="mt-2 text-3xl font-semibold text-gray-900">
            {formatCurrency(yearlyTotals.forecastRevenue)}
          </p>
          {yearlyTotals.actualRevenue > 0 && (
            <p className="mt-2 text-sm text-gray-500">
              Actual: {formatCurrency(yearlyTotals.actualRevenue)}
            </p>
          )}
        </Card>

        <Card className="p-6">
          <h3 className="text-sm font-medium text-gray-500">Forecast Costs</h3>
          <p className="mt-2 text-3xl font-semibold text-gray-900">
            {formatCurrency(yearlyTotals.forecastCosts)}
          </p>
          {yearlyTotals.actualCosts > 0 && (
            <p className="mt-2 text-sm text-gray-500">
              Actual: {formatCurrency(yearlyTotals.actualCosts)}
            </p>
          )}
        </Card>

        <Card className="p-6">
          <h3 className="text-sm font-medium text-gray-500">Forecast Gross Margin</h3>
          <p className="mt-2 text-3xl font-semibold text-gray-900">
            {((yearlyTotals.forecastRevenue - yearlyTotals.forecastCosts) / yearlyTotals.forecastRevenue * 100).toFixed(1)}%
          </p>
          {yearlyTotals.actualRevenue > 0 && (
            <p className="mt-2 text-sm text-gray-500">
              Actual: {((yearlyTotals.actualRevenue - yearlyTotals.actualCosts) / yearlyTotals.actualRevenue * 100).toFixed(1)}%
            </p>
          )}
        </Card>

        <Card className="p-6">
          <h3 className="text-sm font-medium text-gray-500">YTD Variance</h3>
          <p className="mt-2 text-3xl font-semibold text-gray-900">
            {formatCurrency(yearlyTotals.actualRevenue - yearlyTotals.forecastRevenue)}
          </p>
          <p className="mt-2 text-sm text-gray-500">
            {((yearlyTotals.actualRevenue / yearlyTotals.forecastRevenue - 1) * 100).toFixed(1)}% vs Forecast
          </p>
        </Card>
      </div>

      <Card className="p-6">
        <div className="h-[400px]">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Legend />
              
              {/* Forecast Bars */}
              <Bar
                dataKey="forecastRevenue"
                name="Forecast Revenue"
                fill="#818cf8"
                opacity={0.8}
              />
              <Bar
                dataKey="forecastCosts"
                name="Forecast Costs"
                fill="#fb923c"
                opacity={0.8}
              />
              
              {/* Actual Lines */}
              <Line
                type="monotone"
                dataKey="actualRevenue"
                name="Actual Revenue"
                stroke="#4f46e5"
                strokeWidth={2}
                dot={{ r: 4 }}
              />
              <Line
                type="monotone"
                dataKey="actualCosts"
                name="Actual Costs"
                stroke="#ea580c"
                strokeWidth={2}
                dot={{ r: 4 }}
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </Card>
    </div>
  );
}