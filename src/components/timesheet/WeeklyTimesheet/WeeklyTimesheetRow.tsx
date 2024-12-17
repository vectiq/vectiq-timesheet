import { useState, useMemo } from 'react';
import { format } from 'date-fns';
import { X } from 'lucide-react';
import { useWeeklyTimesheet } from './WeeklyTimesheetContext';
import { ProjectSelect } from './ProjectSelect';
import { RoleSelect } from './RoleSelect';
import { HourInput } from './HourInput';
import type { Project, TimeEntry, ProjectRole } from '@/types';

interface Props {
  project?: Project;
  timeEntries: TimeEntry[];
  onProjectSelect: (projectId: string) => void;
  onRoleSelect: (roleId: string) => void;
  onRemove: () => void;
  projects: Project[];
  onHoursChange: (hours: Record<string, string>) => void;
  rowIndex: number;
  selectedRole?: ProjectRole;
}

export function WeeklyTimesheetRow({
  project,
  timeEntries,
  onProjectSelect,
  onRoleSelect,
  onRemove,
  projects,
  onHoursChange,
  rowIndex,
  selectedRole,
}: Props) {
  const { weekDates } = useWeeklyTimesheet();
  const [hours, setHours] = useState<Record<string, string>>({});

  const handleHoursChange = (date: Date, value: string) => {
    const dateKey = format(date, 'yyyy-MM-dd');
    const newHours = { ...hours, [dateKey]: value };
    setHours(newHours);
    onHoursChange(newHours);
  };

  const totalHours = useMemo(() => {
    return Object.values(hours)
      .reduce((sum, value) => sum + (parseFloat(value) || 0), 0)
      .toFixed(2);
  }, [hours]);

  return (
    <div className="grid grid-cols-[200px_150px_repeat(7,1fr)_100px] hover:bg-gray-50">
      <div className="px-4 py-2 flex items-center gap-2">
        <ProjectSelect
          value={project?.id || ''}
          onChange={onProjectSelect}
          projects={projects}
        />
        <button
          onClick={onRemove}
          className="text-gray-400 hover:text-gray-500"
          aria-label="Remove project row"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      <div className="px-4 py-2">
        <RoleSelect
          roles={project?.roles || []}
          value={selectedRole?.id || ''}
          onChange={onRoleSelect}
        />
      </div>
      
      {weekDates.map((date) => (
        <HourInput
          key={date.toISOString()}
          date={date}
          value={hours[format(date, 'yyyy-MM-dd')] || ''}
          onChange={(value) => handleHoursChange(date, value)}
        />
      ))}

      <div className="px-4 py-2 flex items-center justify-center">
        <span className="text-sm font-medium text-gray-900">{totalHours}</span>
      </div>
    </div>
  );
}