import { useMemo } from 'react';
import { format } from 'date-fns';
import { Td } from '@/components/ui/Table';
import { Button } from '@/components/ui/Button';
import { EditableTimeCell } from './EditableTimeCell';
import { X } from 'lucide-react';
import type { TimeEntry, Project } from '@/types';

interface TimesheetRowProps {
  index: number;
  row: {
    clientId: string;
    projectId: string;
    roleId: string;
  };
  weekDays: Date[];
  timeEntries: TimeEntry[];
  clients: Array<{ id: string; name: string }>;
  getProjectsForClient: (clientId: string) => Project[];
  getRolesForProject: (projectId: string) => Array<{ 
    role: { id: string; name: string };
    rates: { costRate: number; sellRate: number };
  }>;
  editingCell: string | null;
  onUpdateRow: (index: number, updates: any) => void;
  onRemoveRow: (index: number) => void;
  onCellChange: (date: string, row: any, value: number | null) => void;
  onStartEdit: (key: string) => void;
  onEndEdit: () => void;
}

export function TimesheetRow({
  index,
  row,
  weekDays,
  timeEntries,
  clients,
  getProjectsForClient,
  getRolesForProject,
  editingCell,
  onUpdateRow,
  onRemoveRow,
  onCellChange,
  onStartEdit,
  onEndEdit,
}: TimesheetRowProps) {
  // Filter entries for this row
  const rowEntries = useMemo(() => {
    if (!row.clientId || !row.projectId || !row.roleId) return [];
    return timeEntries.filter(entry =>
      entry.clientId === row.clientId &&
      entry.projectId === row.projectId &&
      entry.roleId === row.roleId
    );
  },
    [timeEntries, row]
  );

  // Calculate row total
  const rowTotal = useMemo(() => 
    rowEntries.reduce((sum, entry) => sum + entry.hours, 0),
    [rowEntries]
  );

  return (
    <tr>
      <Td>
        <select
          value={row.clientId}
          onChange={(e) => onUpdateRow(index, { 
            clientId: e.target.value,
            projectId: '',
            roleId: ''
          })}
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
          value={row.projectId}
          onChange={(e) => onUpdateRow(index, {
            projectId: e.target.value,
            roleId: ''
          })}
          disabled={!row.clientId}
          className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-sm"
        >
          <option value="">Select Project</option>
          {getProjectsForClient(row.clientId).map(project => (
            <option key={project.id} value={project.id}>
              {project.name}
            </option>
          ))}
        </select>
      </Td>
      <Td>
        <select
          value={row.roleId}
          onChange={(e) => onUpdateRow(index, {
            roleId: e.target.value
          })}
          disabled={!row.projectId}
          className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-sm"
        >
          <option value="">Select Role</option>
          {getRolesForProject(row.projectId).map(({ role }) => (
            <option key={role.id} value={role.id}>
              {role.name}
            </option>
          ))}
        </select>
      </Td>
      {weekDays.map(date => {
        const dateStr = format(date, 'yyyy-MM-dd');
        const entry = rowEntries.find(e => e.date === dateStr);
        const cellKey = `${dateStr}-${row.projectId}-${row.roleId}`;
        
        return (
          <Td key={dateStr} className="text-center p-0">
            <EditableTimeCell
              value={entry?.hours || null}
              onChange={(value) => onCellChange(dateStr, row, value)}
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
      <Td>
        <Button
          variant="secondary"
          size="sm"
          onClick={() => onRemoveRow(index)}
        >
          <X className="h-4 w-4" />
        </Button>
      </Td>
    </tr>
  );
}