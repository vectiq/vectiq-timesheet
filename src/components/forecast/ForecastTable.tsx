import React, { useState, useMemo } from 'react';
import { Table, TableHeader, TableBody, Th, Td } from '@/components/ui/Table';
import { calculateDefaultHours } from '@/lib/utils/workingDays';
import { ForecastInput } from './ForecastInput';
import { ChevronDown, ChevronRight } from 'lucide-react';
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

  // Group projects by client for better organization
  const groupedProjects = useMemo((): ProjectGroup[] => {
    const groups = new Map<string, { name: string; projects: Project[] }>();
    
    projects.forEach(project => {
      if (!groups.has(project.clientId)) {
        const client = clients.find(c => c.id === project.clientId);
        groups.set(project.clientId, {
          name: client?.name || 'Unknown Client',
          projects: []
        });
      }
      groups.get(project.clientId)?.projects.push(project);
    });
    
    return Array.from(groups.entries()).map(([clientId, { name, projects }]) => ({
      clientId,
      clientName: name,
      projects: projects.sort((a, b) => a.name.localeCompare(b.name))
    }));
  }, [projects, clients]);

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

  return (
    <div className="bg-white shadow-sm ring-1 ring-gray-900/5 rounded-lg">
      <Table>
        <TableHeader>
          <tr>
            <Th className="w-8"></Th>
            <Th>Project</Th>
            <Th>Task</Th>
            <Th>User</Th>
            <Th className="text-right">Hours</Th>
          </tr>
        </TableHeader>
        <TableBody>
          {groupedProjects.map(group => (
            <React.Fragment key={group.clientId}>
              <tr className="bg-gray-50">
                <td colSpan={5} className="px-3 py-2 text-sm font-medium text-gray-900">
                  {group.clientName}
                </td>
              </tr>
              {group.projects.map(project => {
                // Get all users assigned to this project's tasks
                const projectAssignments = users.flatMap(user => 
                  (user.projectAssignments || [])
                    .filter(assignment => assignment.projectId === project.id)
                    .map(assignment => ({
                      user,
                      taskId: assignment.taskId,
                      task: project.tasks.find(r => r.id === assignment.taskId)
                    }))
                );

                if (projectAssignments.length === 0) return null;
                const isCollapsed = collapsedProjects.has(project.id);

                return (
                  <React.Fragment key={project.id}>
                    <tr className="border-t border-gray-200">
                      <td className="px-3 py-4">
                        <button
                          onClick={() => toggleProject(project.id)}
                          className="p-1 hover:bg-gray-100 rounded"
                        >
                          {isCollapsed ? (
                            <ChevronRight className="h-4 w-4 text-gray-500" />
                          ) : (
                            <ChevronDown className="h-4 w-4 text-gray-500" />
                          )}
                        </button>
                      </td>
                      <td colSpan={4} className="px-3 py-4 font-medium text-gray-900">
                        {project.name}
                      </td>
                    </tr>
                    {!isCollapsed && projectAssignments.map((assignment, index) => {
                      const key = `${assignment.user.id}-${project.id}-${assignment.taskId}`;
                      const existingForecast = forecastMap.get(key);
                      const defaultHours = calculateDefaultHours(
                        workingDays,
                        assignment.user.hoursPerWeek
                      );

                      return (
                        <tr key={key}>
                          <td></td>
                          <td></td>
                          <Td>{assignment.task?.name}</Td>
                          <Td>{assignment.user.name}</Td>
                          <Td className="text-right">
                            <ForecastInput
                              value={existingForecast?.hours ?? defaultHours}
                              isDefault={!existingForecast}
                              onChange={(hours) => handleHoursChange(
                                assignment.user.id,
                                project.id,
                                assignment.taskId,
                                hours
                              )}
                            />
                          </Td>
                        </tr>
                      );
                    })}
                  </React.Fragment>
                );
              })}
            </React.Fragment>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}