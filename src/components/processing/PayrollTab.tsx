import { useState } from 'react';
import { Card } from '@/components/ui/Card';
import { PayRunCard } from '@/components/payroll/PayRunCard';
import { usePayroll } from '@/lib/hooks/usePayroll';
import { LoadingScreen } from '@/components/ui/LoadingScreen';
import { DollarSign } from 'lucide-react';

export function PayrollTab() {
  const { payRuns, calendars, isLoading } = usePayroll({
    selectedDate: new Date(),
    includeStats: true
  });

  // Helper function to get calendar info
  const getCalendarInfo = (payRun: any) => {
    const calendar = calendars.find(c => c.PayrollCalendarID === payRun.PayrollCalendarID);
    return calendar ? {
      name: calendar.Name,
      type: calendar.CalendarType
    } : null;
  };

  if (isLoading) {
    return <LoadingScreen />;
  }

  return (
    <div className="space-y-6">
      {/* Draft Pay Runs */}
      <Card>
        <div className="p-6">
          <div className="flex items-center gap-2 mb-6">
            <DollarSign className="h-5 w-5 text-amber-500" />
            <h3 className="text-lg font-medium text-gray-900">Draft Pay Runs</h3>
          </div>
          
          <div className="space-y-4">
            {payRuns
              .filter(payRun => payRun.PayRunStatus === 'DRAFT')
              .map((payRun) => {
                const calendar = getCalendarInfo(payRun);
                return (
                  <PayRunCard
                    key={payRun.PayRunID}
                    payRun={payRun}
                    calendarName={calendar?.name}
                    calendarType={calendar?.type}
                  />
                );
              })}
            
            {payRuns.filter(payRun => payRun.PayRunStatus === 'DRAFT').length === 0 && (
              <div className="text-center text-gray-500 py-8">
                No draft pay runs found
              </div>
            )}
          </div>
        </div>
      </Card>

      {/* Posted Pay Runs */}
      <Card>
        <div className="p-6">
          <div className="flex items-center gap-2 mb-6">
            <DollarSign className="h-5 w-5 text-green-500" />
            <h3 className="text-lg font-medium text-gray-900">Posted Pay Runs</h3>
          </div>
          
          <div className="divide-y divide-gray-200">
            {payRuns
              .filter(payRun => payRun.PayRunStatus === 'POSTED')
              .map((payRun) => {
                const calendar = getCalendarInfo(payRun);
                return (
                  <PayRunCard
                    key={payRun.PayRunID}
                    payRun={payRun}
                    calendarName={calendar?.name}
                    calendarType={calendar?.type}
                  />
                );
              })}
          </div>
        </div>
      </Card>
    </div>
  );
}