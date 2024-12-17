import { useState } from 'react';
import { Card } from '@/components/ui/Card';
import { WeeklyTimesheetHeader } from './WeeklyTimesheetHeader';
import { WeeklyTimesheetRow } from './WeeklyTimesheetRow';
import { WeeklyTimesheetActions } from './WeeklyTimesheetActions';
import { Button } from '@/components/ui/Button';
import { Plus } from 'lucide-react';
import { useWeeklyTimesheet } from '@/lib/hooks/useWeeklyTimesheet';
import type { Project, TimeEntry } from '@/types';

interface Props {
  projects: Project[];
  timeEntries: TimeEntry[];
}

export function WeeklyTimesheet({ projects, timeEntries }: Props) {
  const {
    weekDates,
    rows,
    addRow,
    updateRow,
    removeRow,
    totalHours,
    saveTimesheet,
    submitTimesheet,
    copyPreviousWeek,
    isSubmitting,
  } = useWeeklyTimesheet(projects, timeEntries);

  return (
    <div className="space-y-4">
      <Card>
        <div className="overflow-hidden">
          <div className="min-w-full border-b border-gray-200">
            <WeeklyTimesheetHeader dates={weekDates} />
            
            <div className="divide-y divide-gray-200">
              {rows.map((row, index) => {
                const project = projects.find(p => p.id === row.projectId);
                return (
                  <WeeklyTimesheetRow
                    key={index}
                    project={project}
                    selectedRoleId={row.roleId}
                    dates={weekDates}
                    hours={row.hours}
                    onProjectSelect={(projectId) => updateRow(index, { projectId, roleId: '' })}
                    onRoleSelect={(roleId) => updateRow(index, { roleId })}
                    onHoursChange={(hours) => updateRow(index, { hours })}
                    onRemove={() => removeRow(index)}
                    projects={projects}
                  />
                );
              })}
            </div>
          </div>
        </div>

        <div className="p-4 border-t border-gray-200 space-y-4">
          <div className="flex justify-end items-center text-sm">
            <span className="font-medium text-gray-700">Weekly Total:</span>
            <span className="ml-2 font-semibold text-gray-900">{totalHours} hours</span>
          </div>

          <Button
            type="button"
            variant="secondary"
            onClick={addRow}
            className="w-full"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Project Row
          </Button>
        </div>
      </Card>

      <Card className="p-4">
        <WeeklyTimesheetActions
          onSave={saveTimesheet}
          onSubmit={submitTimesheet}
          onCopyPrevious={copyPreviousWeek}
          isSubmitting={isSubmitting}
        />
      </Card>
    </div>
  );
}