import { useMemo } from 'react';
import { format } from 'date-fns';
import { Card } from '@/components/ui/Card';
import { Table, TableHeader, TableBody, Th } from '@/components/ui/Table';
import { Button } from '@/components/ui/Button';
import { Plus } from 'lucide-react';
import { TimesheetRow } from './TimesheetRow';
import { useTimeEntries } from '@/lib/hooks/useTimeEntries';
import { useClients } from '@/lib/hooks/useClients';
import type { Project } from '@/types';

interface WeeklyViewProps {
  projects: Project[];
  dateRange: {
    start: Date;
    end: Date;
  };
}

export function WeeklyView({ projects, dateRange }: WeeklyViewProps) {
  const { 
    timeEntries,
    rows,
    editingCell,
    addRow,
    removeRow,
    updateRow,
    handleCellChange,
    setEditingCell
  } = useTimeEntries({ dateRange });

  const { clients } = useClients();

  const weekDays = useMemo(() => {
    const days: Date[] = [];
    let currentDate = new Date(dateRange.start);
    while (currentDate <= dateRange.end) {
      days.push(new Date(currentDate));
      currentDate.setDate(currentDate.getDate() + 1);
    }
    return days;
  }, [dateRange]);

  // Helper functions for getting related data
  const getProjectsForClient = (clientId: string) => 
    projects.filter(p => p.clientId === clientId);

  const getRolesForProject = (projectId: string) => {
    const project = projects.find(p => p.id === projectId);
    if (!project) return [];
    
    return project.roles.map(projectRole => ({
      role: { id: projectRole.roleId, name: projectRole.roleId },
      rates: projectRole
    }));
  };

  // Calculate weekly total
  const weeklyTotal = useMemo(() => 
    timeEntries.reduce((total, entry) => total + entry.hours, 0),
    [timeEntries]
  );

  return (
    <Card>
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <tr className="border-b border-gray-200">
              <Th className="w-[200px]">Client</Th>
              <Th className="w-[200px]">Project</Th>
              <Th className="w-[200px]">Role</Th>
              {weekDays.map(day => (
                <Th key={day.toISOString()} className="w-[100px] text-center">
                  <div>{format(day, 'EEE')}</div>
                  <div className="text-gray-500">{format(day, 'MMM d')}</div>
                </Th>
              ))}
              <Th className="w-[100px] text-center">Total</Th>
              <Th className="w-[50px]"></Th>
            </tr>
          </TableHeader>
          <TableBody>
            {rows.map((row, index) => (
              <TimesheetRow
                key={index}
                index={index}
                row={row}
                weekDays={weekDays}
                timeEntries={timeEntries}
                clients={clients}
                getProjectsForClient={getProjectsForClient}
                getRolesForProject={getRolesForProject}
                editingCell={editingCell}
                onUpdateRow={updateRow}
                onRemoveRow={removeRow}
                onCellChange={handleCellChange}
                onStartEdit={setEditingCell}
                onEndEdit={() => setEditingCell(null)}
              />
            ))}
          </TableBody>
        </Table>
      </div>

      <div className="p-4 border-t space-y-4">
        <div className="flex justify-between items-center">
          <div className="text-sm">
            <span className="font-medium text-gray-700">Weekly Total:</span>
            <span className="ml-2 font-semibold text-gray-900">
              {weeklyTotal.toFixed(2)} hours
            </span>
          </div>
        </div>
        <Button
          variant="secondary"
          onClick={addRow}
          className="w-full"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Row
        </Button>
      </div>
    </Card>
  );
}