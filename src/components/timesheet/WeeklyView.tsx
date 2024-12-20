import { useMemo, useCallback } from 'react';
import { format } from 'date-fns';
import { Card } from '@/components/ui/Card';
import { Table, TableHeader, TableBody, Th, Td } from '@/components/ui/Table';
import { Button } from '@/components/ui/Button';
import { Plus, X } from 'lucide-react';
import { useTimeEntries } from '@/lib/hooks/useTimeEntries';
import { useClients } from '@/lib/hooks/useClients';
import { auth } from '@/lib/firebase';
import type { Project, TimeEntry } from '@/types';

interface WeeklyViewProps {
  projects: Project[];
  dateRange: {
    start: Date;
    end: Date;
  };
}

export function WeeklyView({ projects, dateRange }: WeeklyViewProps) {
  const userId = auth.currentUser?.uid;
  const { timeEntries, createTimeEntry, updateTimeEntry, deleteTimeEntry } = useTimeEntries({ userId });
  const { clients } = useClients();

  // Get projects for a client
  const getProjectsForClient = useCallback((clientId: string) => 
    projects.filter(p => p.clientId === clientId),
    [projects]
  );

  // Get roles for a project
  const getRolesForProject = useCallback((projectId: string) => {
    const project = projects.find(p => p.id === projectId);
    if (!project) return [];
    
    return project.roles.map(projectRole => ({
      role: { id: projectRole.roleId, name: projectRole.roleId },
      rates: projectRole
    }));
  }, [projects]);

  const weekDays = useMemo(() => {
    const days: Date[] = [];
    let currentDate = new Date(dateRange.start);
    while (currentDate <= dateRange.end) {
      days.push(new Date(currentDate));
      currentDate.setDate(currentDate.getDate() + 1);
    }
    return days;
  }, [dateRange]);

  // Group time entries by project and role
  const groupedEntries = useMemo(() => {
    const groups: Record<string, TimeEntry[]> = {};
    
    timeEntries.forEach(entry => {
      const key = `${entry.projectId}-${entry.roleId}`;
      if (!groups[key]) {
        groups[key] = [];
      }
      groups[key].push(entry);
    });
    
    return groups;
  }, [timeEntries]);

  const handleAddEntry = useCallback(async (date: string) => {
    if (!userId) return;
    
    await createTimeEntry({
      userId,
      date,
      projectId: '',
      roleId: '',
      clientId: '',
      hours: 0,
      description: '',
    });
  }, [userId, createTimeEntry]);

  const handleUpdateEntry = useCallback(async (
    entryId: string,
    updates: Partial<TimeEntry>
  ) => {
    await updateTimeEntry(entryId, updates);
  }, [updateTimeEntry]);

  const handleDeleteEntry = useCallback(async (entryId: string) => {
    await deleteTimeEntry(entryId);
  }, [deleteTimeEntry]);

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
            {Object.entries(groupedEntries).map(([key, entries]) => {
              const [projectId, roleId] = key.split('-');
              const project = projects.find(p => p.id === projectId);
              const client = project ? clients.find(c => c.id === project.clientId) : null;
              
              const availableProjects = client
                ? getProjectsForClient(client.id)
                : [];

              const availableRoles = projectId
                ? getRolesForProject(projectId)
                : [];

              // Calculate row total
              const rowTotal = entries.reduce(
                (sum, entry) => sum + entry.hours,
                0
              );

              return (
                <tr key={key}>
                  <Td>
                    <select
                      value={client?.id || ''}
                      onChange={(e) => {
                        // Handle client change
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
                      value={projectId}
                      onChange={(e) => {
                        // Handle project change
                      }}
                      disabled={!client}
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
                    <select
                      value={roleId}
                      onChange={(e) => {
                        // Handle role change
                      }}
                      disabled={!projectId}
                      className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-sm"
                    >
                      <option value="">Select Role</option>
                      {availableRoles.map(({ role, rates }) => (
                        <option key={role.id} value={role.id}>
                          {role.name} ({rates.costRate}/{rates.sellRate})
                        </option>
                      ))}
                    </select>
                  </Td>
                  {weekDays.map(date => {
                    const dateStr = format(date, 'yyyy-MM-dd');
                    const entry = entries.find(e => e.date === dateStr);
                    
                    return (
                      <Td key={dateStr} className="text-center p-0">
                        <div
                          onClick={() => {
                            if (entry) {
                              handleUpdateEntry(entry.id, {
                                hours: entry.hours + 1
                              });
                            } else {
                              handleAddEntry(dateStr);
                            }
                          }}
                          className="w-16 py-2 text-center cursor-pointer rounded hover:bg-gray-50"
                        >
                          {entry ? entry.hours.toFixed(2) : '-'}
                        </div>
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
                      onClick={() => entries.forEach(e => handleDeleteEntry(e.id))}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </Td>
                </tr>
              );
            })}
          </TableBody>
        </Table>
      </div>
      <div className="p-4 border-t space-y-4">
        <div className="flex justify-between items-center">
          <div className="text-sm">
            <span className="font-medium text-gray-700">Weekly Total:</span>
            <span className="ml-2 font-semibold text-gray-900">{weeklyTotal.toFixed(2)} hours</span>
          </div>
        </div>
        <Button
          variant="secondary"
          onClick={() => handleAddEntry(format(new Date(), 'yyyy-MM-dd'))}
          className="w-full"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Row
        </Button>
      </div>
    </Card>
  );
}