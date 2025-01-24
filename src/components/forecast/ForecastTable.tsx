import React, { useState, useMemo } from 'react';
import { Table, TableHeader, TableBody, Th, Td } from '@/components/ui/Table';
import { calculateDefaultHours } from '@/lib/utils/workingDays';
import { ForecastInput } from './ForecastInput';
import { ChevronDown, ChevronRight } from 'lucide-react';
import { useLeaveForecasts } from '@/lib/hooks/useLeaveForecasts';
import { Badge } from '@/components/ui/Badge';
import type { User, Project, Client, ForecastEntry } from '@/types';

interface ProjectGroup {
  clientId: string;
  clientName: string;
  projects: Project[];
}

interface ForecastTableProps {
  month: string;
  workingDays: number;
  clients: Client[];
  users: User[];
  projects: Project[];
  forecasts: ForecastEntry[];
  onCreateForecast: (data: Omit<ForecastEntry, 'id'>) => Promise<void>;
  onUpdateForecast: (id: string, hours: number) => Promise<void>;
}

export function ForecastTable({
  month,
  workingDays,
  clients,
  users,
  projects,
  forecasts,
  onCreateForecast,
  onUpdateForecast,
}: ForecastTableProps) {
  const [collapsedProjects, setCollapsedProjects] = useState<Set<string>>(new Set());
  const { leaveData } = useLeaveForecasts(month);

  // Separate users by type
  const { employees, contractors } = useMemo(() => {
    return users.reduce((acc, user) => {
      if (user.employeeType === 'employee') {
        acc.employees.push(user);
      } else if (user.employeeType === 'contractor') {
        acc.contractors.push(user);
      }
      return acc;
    }, { employees: [] as User[], contractors: [] as User[] });
  }, [users]);

  // Create a map of existing forecasts for quick lookup
  const forecastMap = useMemo(() => {
    const map = new Map<string, ForecastEntry>();
    forecasts.forEach(forecast => {
      const key = `${forecast.userId}-${forecast.projectId}-${forecast.taskId}`;
      map.set(key, forecast);
    });
    return map;
  }, [forecasts]);

  const handleHoursChange = async (
    userId: string,
    projectId: string,
    taskId: string,
    hours: number
  ) => {
    const key = `${userId}-${projectId}-${taskId}`;
    const existingForecast = forecastMap.get(key);

    if (existingForecast) {
      await onUpdateForecast(existingForecast.id, hours);
    } else {
      await onCreateForecast({
        month,
        userId,
        projectId,
        taskId,
        hours,
        isDefault: false
      });
    }
  };

  const toggleProject = (projectId: string) => {
    setCollapsedProjects(prev => {
      const next = new Set(prev);
      if (next.has(projectId)) {
        next.delete(projectId);
      } else {
        next.add(projectId);
      }
      return next;
    });
  };

  const renderUserSection = (users: User[], title: string) => {
    if (users.length === 0) return null;

    return (
      <div className="space-y-4">
        <div className="bg-gray-50 px-4 py-2 rounded-lg">
          <h3 className="font-medium text-gray-900">{title}</h3>
        </div>

        <Table>
          <TableHeader>
            <tr>
              <Th>User</Th>
              <Th>Project</Th>
              <Th>Task</Th>
              <Th className="text-right">Hours</Th>
            </tr>
          </TableHeader>
          <TableBody>
            {users.map(user => {
              // Get all assignments for this user
              const userAssignments = projects.flatMap(project =>
                project.tasks.flatMap(task => {
                  const assignment = task.userAssignments?.find(a => a.userId === user.id);
                  if (!assignment) return [];
                  return [{
                    user,
                    project,
                    task,
                    client: clients.find(c => c.id === project.clientId)
                  }];
                })
              );

              if (userAssignments.length === 0) return null;

              return userAssignments.map(({ project, task, client }, index) => {
                const key = `${user.id}-${project.id}-${task.id}`;
                const existingForecast = forecastMap.get(key);
                const defaultHours = calculateDefaultHours(
                  workingDays,
                  user.hoursPerWeek || 40
                );

                // Handle leave project differently
                let hours = defaultHours;
                if (project.name === 'Leave' && leaveData?.leave) {
                  // Find leave entries for this user and leave type
                  const userLeave = leaveData.leave.filter(leave => 
                    leave.employeeId === user.id &&
                    leave.leaveTypeId === task.xeroLeaveTypeId
                  );
                  
                  // Sum up leave hours for this month
                  hours = userLeave.reduce((sum, leave) => sum + leave.numberOfUnits, 0);
                }

                return (
                  <tr key={key}>
                    {index === 0 && (
                      <Td rowSpan={userAssignments.length} className="align-top">
                        <div>
                          <div className="font-medium">{user.name}</div>
                          <div className="text-sm text-gray-500">
                            {user.hoursPerWeek || 40} hrs/week
                          </div>
                          {user.estimatedBillablePercentage && (
                            <Badge variant="secondary" className="mt-1">
                              {user.estimatedBillablePercentage}% Billable
                            </Badge>
                          )}
                        </div>
                      </Td>
                    )}
                    <Td>
                      <div>
                        <div className="font-medium">{project.name}</div>
                        <div className="text-sm text-gray-500">{client?.name}</div>
                      </div>
                    </Td>
                    <Td>{task.name}</Td>
                    <Td className="text-right">
                      <ForecastInput
                        value={existingForecast?.hours ?? hours}
                        isDefault={!existingForecast}
                        onChange={(hours) => handleHoursChange(
                          user.id,
                          project.id,
                          task.id,
                          hours
                        )}
                      />
                    </Td>
                  </tr>
                );
              });
            })}
          </TableBody>
        </Table>
      </div>
    );
  };

  return (
    <div className="space-y-8">
      {renderUserSection(employees, "Employees")}
      {renderUserSection(contractors, "Contractors")}
    </div>
  );
}