import { useState } from 'react';
import { Card } from '@/components/ui/Card';
import { useReports } from '@/lib/hooks/useReports';
import { LoadingScreen } from '@/components/ui/LoadingScreen';
import { DateNavigation } from '@/components/timesheet/DateNavigation';
import { useDateNavigation } from '@/lib/hooks/useDateNavigation';
import { format } from 'date-fns';
import type { OvertimeReportEntry } from '@/types';

export function OvertimeReport() {
  const dateNav = useDateNavigation({ type: 'month' });
  const { data, isLoading } = useReports({ 
    type: 'overtime',
    startDate: format(dateNav.dateRange.start, 'yyyy-MM-dd'),
    endDate: format(dateNav.dateRange.end, 'yyyy-MM-dd')
  });

  if (isLoading) {
    return <LoadingScreen />;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <DateNavigation
          currentDate={dateNav.currentDate}
          onPrevious={dateNav.goToPrevious}
          onNext={dateNav.goToNext}
          onToday={dateNav.goToToday}
          formatString="MMMM yyyy"
        />
      </div>

      <Card>
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="mt-8 flow-root">
            <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
              <div className="inline-block min-w-full py-2 align-middle">
                <table className="min-w-full divide-y divide-gray-300">
                  <thead>
                    <tr>
                      <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900">
                        Employee
                      </th>
                      <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                        Hours/Week
                      </th>
                      <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                        Total Hours
                      </th>
                      <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                        Overtime Hours
                      </th>
                      <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                        Projects
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {data?.entries.map((entry) => (
                      <tr key={entry.userId}>
                        <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm">
                          <div className="font-medium text-gray-900">{entry.userName}</div>
                          <div className="text-gray-500">{entry.overtimeType === 'no' ? 'No Overtime' : entry.overtimeType === 'billable' ? 'Billable Only' : 'All Hours'}</div>
                        </td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                          {entry.hoursPerWeek}
                        </td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                          {entry.totalHours.toFixed(2)}
                        </td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm">
                          <span className={`font-medium ${entry.overtimeHours > 0 ? 'text-yellow-600' : 'text-gray-500'}`}>
                            {entry.overtimeHours.toFixed(2)}
                          </span>
                        </td>
                        <td className="px-3 py-4 text-sm text-gray-500">
                          <div className="space-y-1">
                            {entry.projects.map(project => (
                              <div key={project.projectId} className="flex justify-between">
                                <span>{project.projectName}</span>
                                <span className="font-medium">
                                  <span className="ml-1">{project.hours.toFixed(2)}</span>
                                </span>
                              </div>
                            ))}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr className="border-t border-gray-200">
                      <th scope="row" colSpan={3} className="px-4 py-3 text-right text-sm font-medium text-gray-900">
                        Total Overtime Hours:
                      </th>
                      <td className="px-3 py-3 text-sm font-medium text-yellow-600">
                        {data?.summary.totalOvertimeHours.toFixed(2)}
                      </td>
                      <td />
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}