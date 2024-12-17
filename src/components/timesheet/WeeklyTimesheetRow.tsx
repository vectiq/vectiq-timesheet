import { format } from 'date-fns';
import { Project } from '@/types';
import { X } from 'lucide-react';

interface Props {
  project?: Project;
  selectedRoleId: string;
  dates: Date[];
  hours: Record<string, string>;
  onProjectSelect: (projectId: string) => void;
  onRoleSelect: (roleId: string) => void;
  onHoursChange: (hours: Record<string, string>) => void;
  onRemove: () => void;
  projects: Project[];
}

export function WeeklyTimesheetRow({
  project,
  selectedRoleId,
  dates,
  hours,
  onProjectSelect,
  onRoleSelect,
  onHoursChange,
  onRemove,
  projects,
}: Props) {
  const handleHoursChange = (date: Date, value: string) => {
    const dateKey = format(date, 'yyyy-MM-dd');
    const newHours = { ...hours, [dateKey]: value };
    onHoursChange(newHours);
  };

  const totalHours = Object.values(hours)
    .reduce((sum, value) => sum + (parseFloat(value) || 0), 0)
    .toFixed(2);

  return (
    <div className="grid grid-cols-[200px_150px_repeat(7,1fr)_100px] hover:bg-gray-50">
      <div className="px-4 py-2 flex items-center gap-2">
        <select
          value={project?.id || ''}
          onChange={(e) => onProjectSelect(e.target.value)}
          className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-sm"
        >
          <option value="">Select Project</option>
          {projects.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name}
            </option>
          ))}
        </select>
        <button
          onClick={onRemove}
          className="text-gray-400 hover:text-gray-500"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      <div className="px-4 py-2">
        <select
          value={selectedRoleId}
          onChange={(e) => onRoleSelect(e.target.value)}
          className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-sm"
          disabled={!project}
        >
          <option value="">Select Role</option>
          {project?.roles.map((role) => (
            <option key={role.id} value={role.id}>
              {role.name}
            </option>
          ))}
        </select>
      </div>
      
      {dates.map((date) => {
        const dateKey = format(date, 'yyyy-MM-dd');
        return (
          <div key={dateKey} className="px-4 py-2">
            <input
              type="number"
              min="0"
              max="24"
              step="0.25"
              value={hours[dateKey] || ''}
              onChange={(e) => handleHoursChange(date, e.target.value)}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-sm text-center"
              placeholder="0.00"
              disabled={!selectedRoleId}
            />
          </div>
        );
      })}

      <div className="px-4 py-2 flex items-center justify-center">
        <span className="text-sm font-medium text-gray-900">{totalHours}</span>
      </div>
    </div>
  );
}