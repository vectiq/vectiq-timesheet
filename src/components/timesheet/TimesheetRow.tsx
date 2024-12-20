import { Td } from '@/components/ui/Table';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { EditableTimeCell } from './EditableTimeCell';
import { useTimesheetData } from '@/lib/hooks/useTimesheetData';

interface TimesheetRowProps {
  dates: Date[];
  selectedClientId?: string;
  selectedProjectId?: string;
  selectedRoleId?: string;
  hours: Record<string, number | null>;
  onClientChange: (clientId: string) => void;
  onProjectChange: (projectId: string) => void;
  onRoleChange: (roleId: string) => void;
  onHoursChange: (date: string, hours: number | null) => void;
  onRemove: () => void;
  editingCell: string | null;
  onStartEdit: (key: string) => void;
  onEndEdit: () => void;
}

export function TimesheetRow({
  dates,
  selectedClientId,
  selectedProjectId,
  selectedRoleId,
  hours,
  onClientChange,
  onProjectChange,
  onRoleChange,
  onHoursChange,
  onRemove,
  editingCell,
  onStartEdit,
  onEndEdit,
}: TimesheetRowProps) {
  const { 
    clients, 
    getProjectsForClient, 
    getRolesForProject 
  } = useTimesheetData();

  const availableProjects = selectedClientId 
    ? getProjectsForClient(selectedClientId)
    : [];

  const availableRoles = selectedProjectId 
    ? getRolesForProject(selectedProjectId)
    : [];

  // Calculate row total
  const rowTotal = Object.values(hours).reduce(
    (sum, value) => sum + (value || 0),
    0
  );

  return (
    <tr>
      <Td>
        <select
          value={selectedClientId || ''}
          onChange={(e) => {
            onClientChange(e.target.value);
            onProjectChange('');
            onRoleChange('');
          }}
          className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-sm"
        >
          <option value="">Select Client</option>
          {clients.map(client => (
            <option key={client.id} value={client.id}>
              {client.name}
            </option>
          ))}
        </select>
      </Td>
      <Td>
        <select
          value={selectedProjectId || ''}
          onChange={(e) => {
            onProjectChange(e.target.value);
            onRoleChange('');
          }}
          disabled={!selectedClientId}
          className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-sm"
        >
          <option value="">Select Project</option>
          {availableProjects.map(project => (
            <option key={project.id} value={project.id}>
              {project.name}
            </option>
          ))}
        </select>
      </Td>
      <Td>
        <div className="flex items-center gap-2">
          <select
            value={selectedRoleId || ''}
            onChange={(e) => onRoleChange(e.target.value)}
            disabled={!selectedProjectId}
            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-sm"
          >
            <option value="">Select Role</option>
            {availableRoles.map(({ role, rates }) => (
              <option key={role.id} value={role.id}>
                {role.name} ({rates.costRate}/{rates.sellRate})
              </option>
            ))}
          </select>
          
        </div>
      </Td>
      {dates.map(date => {
        const dateStr = date.toISOString().split('T')[0];
        const cellKey = `${dateStr}-${selectedProjectId}-${selectedRoleId}`;
        
        return (
          <Td key={dateStr} className="text-center p-0">
            <EditableTimeCell
              value={hours[dateStr] || null}
              onChange={(value) => onHoursChange(dateStr, value)}
              isEditing={editingCell === cellKey}
              onStartEdit={() => onStartEdit(cellKey)}
              onEndEdit={onEndEdit}
            />
          </Td>
        );
      })}
      <Td className="text-center font-medium">
        {rowTotal.toFixed(2)}
      </Td>
      <Td><Button
            variant="secondary"
            size="sm"
            onClick={onRemove}
            className="shrink-0"
          >
            <X className="h-4 w-4" />
          </Button></Td>
    </tr>
  );
}