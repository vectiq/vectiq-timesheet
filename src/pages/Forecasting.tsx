import { useState } from 'react';
import { format } from 'date-fns';
import { Card } from '@/components/ui/Card'; 
import { formatCurrency } from '@/lib/utils/currency';
import { Button } from '@/components/ui/Button';
import { DateNavigation } from '@/components/timesheet/DateNavigation';
import { UserForecastTable } from '@/components/forecasting/UserForecastTable';
import { useForecasting } from '@/lib/hooks/useForecasting';
import { LoadingScreen } from '@/components/ui/LoadingScreen';
import { Calendar, TrendingUp } from 'lucide-react';

export default function Forecasting() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const { forecasts, workingDays, userForecasts, isLoading } = useForecasting(currentDate);

  // Calculate summary totals from user forecasts
  const summary = userForecasts.reduce((acc, user) => {
    user.projectAssignments.forEach(assignment => {
      const hours = assignment.forecastedHours;
      const cost = hours * assignment.costRate;
      const revenue = hours * assignment.sellRate;
      
      acc.totalCost += cost;
      acc.totalRevenue += revenue;
    });
    return acc;
  }, { totalCost: 0, totalRevenue: 0 });

  const grossMargin = summary.totalRevenue > 0 
    ? ((summary.totalRevenue - summary.totalCost) / summary.totalRevenue) * 100 
    : 0;

  if (isLoading) {
    return <LoadingScreen />;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold text-gray-900">Forecasting</h1>
        <DateNavigation
          currentDate={currentDate}
          onPrevious={() => setCurrentDate(prev => new Date(prev.setMonth(prev.getMonth() - 1)))}
          onNext={() => setCurrentDate(prev => new Date(prev.setMonth(prev.getMonth() + 1)))}
          onToday={() => setCurrentDate(new Date())}
          formatString="MMMM yyyy"
        />
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <div className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <Calendar className="h-5 w-5 text-indigo-600" />
              <h2 className="text-lg font-medium">Working Days</h2>
            </div>
            {workingDays && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-sm text-gray-500">Total Days</div>
                    <div className="text-2xl font-semibold">{workingDays.totalDays}</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-500">Working Days</div>
                    <div className="text-2xl font-semibold">{workingDays.workingDays}</div>
                  </div>
                </div>
                {workingDays.holidays.length > 0 && (
                  <div>
                    <div className="text-sm font-medium mb-2">Public Holidays</div>
                    <div className="space-y-1">
                      {workingDays.holidays.map(holiday => (
                        <div key={holiday.date} className="text-sm">
                          <span className="text-gray-500">
                            {format(new Date(holiday.date), 'MMM d')}:
                          </span>{' '}
                          {holiday.name}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </Card>

        <Card>
          <div className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp className="h-5 w-5 text-indigo-600" />
              <h2 className="text-lg font-medium">Forecast Summary</h2>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="text-sm text-gray-500">Total Revenue</div>
                <div className="text-2xl font-semibold">{formatCurrency(summary.totalRevenue)}</div>
              </div>
              <div>
                <div className="text-sm text-gray-500">Total Cost</div>
                <div className="text-2xl font-semibold">{formatCurrency(summary.totalCost)}</div>
              </div>
              <div>
                <div className="text-sm text-gray-500">Estimated GM</div>
                <div className="text-2xl font-semibold">{formatCurrency(summary.totalRevenue - summary.totalCost)}</div>
              </div>
              <div>
                <div className="text-sm text-gray-500">GM%</div>
                <div className="text-2xl font-semibold">{grossMargin.toFixed(1)}%</div>
              </div>
            </div>
          </div>
        </Card>
      </div>

      <Card>
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-medium">User Forecasts</h2>
            <Button>Update Forecast</Button>
          </div>
          <UserForecastTable 
            userForecasts={userForecasts}
            onUpdateHours={(userId, projectId, roleId, hours) => {
              console.log('Update hours:', { userId, projectId, roleId, hours });
              // TODO: Implement hours update
            }}
          />
        </div>
      </Card>
    </div>
  );
}