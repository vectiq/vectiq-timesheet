import { memo, useMemo } from 'react';
import { format } from 'date-fns';
import { Td } from '@/components/ui/Table';
import { Select, SelectTrigger, SelectContent, SelectItem } from '@/components/ui/Select';
import { Button } from '@/components/ui/Button';
import { EditableTimeCell } from './EditableTimeCell';
import { cn } from '@/lib/utils/styles';
import { X, Lock } from 'lucide-react';
import { useApprovals } from '@/lib/hooks/useApprovals'; 
import { useProjects } from '@/lib/hooks/useProjects';
import { useClients } from '@/lib/hooks/useClients';
import type { TimeEntry } from '@/types';

interface TimesheetRowProps {
  index: number;
  row: {
    clientId: string;
    projectId: string;
    taskId: string;
  };
  weekKey: string;
  weekDays: Date[];
  timeEntries: TimeEntry[];
  getProjectsForClient: (clientId: string) => Project[];
  getTasksForProject: (projectId: string) => ProjectTask[];
  editingCell: string | null;
  onUpdateRow: (index: number, updates: any) => void;
  onRemoveRow: (index: number) => void;
  onCellChange: (date: string, row: any, value: number | null) => void;
  onStartEdit: (key: string) => void;
  onEndEdit: () => void;
  userId: string;
}

export const TimesheetRow = memo(function TimesheetRow({
  index,
  row,
  weekKey,
  weekDays,
  timeEntries,
  getProjectsForClient,
  getTasksForProject,
  editingCell,
  onUpdateRow,
  onRemoveRow,
  onCellChange,
  onStartEdit,
  onEndEdit,
  userId
}: TimesheetRowProps) {
  const { projects } = useProjects();
  const { clients } = useClients();
  const { approvals } = useApprovals(); 

  // Get available projects for selected client
  const availableProjects = useMemo(() => {
    if (!row.clientId) return [];
    // Only return projects where user has task assignments
    return getProjectsForClient(row.clientId).filter(project =>
      project.tasks.some(task => 
        task.userAssignments?.some(a => a.userId === userId)
      )
    );
  }, [row.clientId, getProjectsForClient, userId]);

  // Get available tasks for selected project
  const availableTasks = useMemo(() => {
    if (!row.projectId) return [];
    return getTasksForProject(row.projectId);
  }, [row.projectId, getTasksForProject]);

  // Get available clients and projects based on user assignments
  const availableClients = useMemo(() => {
    if (!userId || !projects) return [];
    
    // Get unique client IDs from projects where user has task assignments
    const clientIds = new Set(
      projects
        .filter(project => 
          project.tasks.some(task => 
            task.userAssignments?.some(a => a.userId === userId)
          )
        )
        .map(p => p.clientId)
    );
    
    return clients.filter(client => clientIds.has(client.id));
  }, [userId, projects, clients]);

  // Get row entries
  const rowEntries = !row.clientId || !row.projectId || !row.taskId 
    ? []
    : timeEntries.filter(entry =>
      entry.clientId === row.clientId &&
      entry.projectId === row.projectId &&
      entry.taskId === row.taskId
    );

  // Calculate row total
  const rowTotal = rowEntries.reduce((sum, entry) => sum + entry.hours, 0);

  // Query approvals for each date in the week
  const weekApprovals = weekDays.map(date => {
    const dateStr = format(date, 'yyyy-MM-dd');
    return approvals.find((approval) => 
      approval.project.id === row.projectId &&
      dateStr >= approval.startDate &&
      dateStr <= approval.endDate);
  });

  // Check if the entire row is locked
  const hasLockedEntries = weekApprovals?.some(approval => approval?.status === 'pending' || approval?.status === 'approved');

  return (
    <tr>
      <Td>
        <Select
          value={row.clientId}
          onValueChange={(value) => onUpdateRow(index, { 
            clientId: value,
            projectId: '',
            taskId: ''
          })}
          disabled={hasLockedEntries}
        >
          <SelectTrigger 
            className={cn(
              hasLockedEntries && "opacity-50 cursor-not-allowed bg-gray-50"
            )}
            title={hasLockedEntries ? "Cannot modify row with pending or approved entries" : undefined}
          >
            {row.clientId ? availableClients.find(c => c.id === row.clientId)?.name : "Select Client"}
          </SelectTrigger>
          <SelectContent>
            {availableClients.map(client => (
              <SelectItem key={client.id} value={client.id}>
                {client.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </Td>
      <Td>
        <Select
          value={row.projectId}
          onValueChange={(value) => onUpdateRow(index, {
            projectId: value,
            taskId: ''
          })}
          disabled={!row.clientId || hasLockedEntries}
        >
          <SelectTrigger
            className={cn(
              hasLockedEntries && "opacity-50 cursor-not-allowed bg-gray-50"
            )}
            title={hasLockedEntries ? "Cannot modify row with pending or approved entries" : undefined}
          >
            {row.projectId ? availableProjects.find(p => p.id === row.projectId)?.name : "Select Project"}
          </SelectTrigger>
          <SelectContent>
            {availableProjects.map(project => (
              <SelectItem key={project.id} value={project.id}>
                {project.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </Td>
      <Td>
        <Select
          value={row.taskId}
          onValueChange={(value) => onUpdateRow(index, {
            taskId: value
          })}
          disabled={!row.projectId || hasLockedEntries}
        >
          <SelectTrigger
            className={cn(
              hasLockedEntries && "opacity-50 cursor-not-allowed bg-gray-50"
            )}
            title={hasLockedEntries ? "Cannot modify row with pending or approved entries" : undefined}
          >
            {row.taskId ? availableTasks.find(t => t.id === row.taskId)?.name : "Select Task"}
          </SelectTrigger>
          <SelectContent>
            {availableTasks.map(task => (
              <SelectItem key={task.id} value={task.id}>
                {task.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </Td>
      {weekDays.map(date => {
        const dateStr = format(date, 'yyyy-MM-dd');
        const entry = rowEntries.find(e => e.date === dateStr);
        const cellKey = `${dateStr}-${row.projectId}-${row.taskId}`;
        const isRowComplete = row.clientId && row.projectId && row.taskId;
        const isLocked = weekApprovals[weekDays.indexOf(date)]?.status === 'pending' || weekApprovals[weekDays.indexOf(date)]?.status === 'approved';
        
        return (
          <Td key={dateStr} className="text-center p-0">
            <EditableTimeCell
              value={entry?.hours || null}
              onChange={(value) => onCellChange(dateStr, row, value)}
              isEditing={editingCell === cellKey}
              onStartEdit={() => onStartEdit(cellKey)}
              onEndEdit={onEndEdit}
              isDisabled={!isRowComplete}
              isLocked={isLocked}
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
          disabled={hasLockedEntries}
          title={hasLockedEntries ? "Cannot delete row with locked entries" : undefined}
          onClick={() => onRemoveRow(index)}
          className={hasLockedEntries ? "opacity-50 cursor-not-allowed" : ""}
        >
          {hasLockedEntries ? (
            <Lock className="h-4 w-4 text-gray-400" />
          ) : (
            <X className="h-4 w-4" />
          )}
        </Button>
      </Td>
    </tr>
  );
});

TimesheetRow.displayName = 'TimesheetRow';