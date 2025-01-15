import React, { useState, useMemo } from 'react';
import { Table, TableHeader, TableBody, Th, Td } from '@/components/ui/Table';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { ChevronDown, ChevronRight, TrendingUp, TrendingDown } from 'lucide-react';
import { formatCurrency } from '@/lib/utils/currency';
import { getWorkingDaysForMonth, calculateDefaultHours } from '@/lib/utils/workingDays';
import type { ForecastEntry, ReportData, User, Project, Client } from '@/types';

interface ForecastReportTableProps {
  forecasts: ForecastEntry[];
  actuals: ReportData;
  month: string;
  users: User[];
  projects: Project[];
  clients: Client[];
  workingDays: number;
}

interface ProjectSummary {
  id: string;
  name: string;
  clientName: string;
  forecast: {
    revenue: number;
    cost: number;
    grossMargin: number;
  };
  actual: {
    revenue: number;
    cost: number;
    grossMargin: number;
  };
  tasks: Array<{
    taskId: string;
    taskName: string;
    userId: string;
    userName: string;
    forecast: {
      hours: number;
      revenue: number;
      cost: number;
    };
    actual: {
      hours: number;
      revenue: number;
      cost: number;
    };
  }>;
}

export function ForecastReportTable({ 
  forecasts, 
  actuals, 
  month,
  users,
  projects,
  clients,
  workingDays
}: ForecastReportTableProps) {
  const [expandedProjects, setExpandedProjects] = useState<Set<string>>(new Set());

  // Calculate project summaries with forecasts and actuals
  const projectSummaries = useMemo((): ProjectSummary[] => {
    const summaries = new Map<string, ProjectSummary>();

    // Early return if no actuals data
    if (!actuals?.entries) {
      return [];
    }

    // Helper to get forecast hours for a user/project/role
    const getForecastHours = (userId: string, projectId: string, taskId: string) => {
      const forecast = forecasts.find(f => 
        f.userId === userId && 
        f.projectId === projectId && 
        f.taskId === taskId
      );
      
      if (forecast) {
        return forecast.hours;
      }
      
      // Calculate default hours if no forecast exists and user is assigned to the task
      const project = projects.find(p => p.id === projectId);
      const task = project?.tasks.find(t => t.id === taskId);
      const isAssigned = task?.userAssignments?.some(a => a.userId === userId);
      
      if (isAssigned) {
        const user = users.find(u => u.id === userId);
        return calculateDefaultHours(workingDays, user?.hoursPerWeek || 40);
      }
      
      return 0;
    };

    // Process each project
    projects.forEach(project => {
      const client = clients.find(c => c.id === project.clientId);
      if (!client) return;

      const summary: ProjectSummary = {
        id: project.id,
        name: project.name,
        clientName: client.name,
        forecast: { revenue: 0, cost: 0, grossMargin: 0 },
        actual: { revenue: 0, cost: 0, grossMargin: 0 },
        tasks: []
      };

      // Process each task and its user assignments
      project.tasks.forEach(task => {
        task.userAssignments?.forEach(assignment => {
          const user = users.find(u => u.id === assignment.userId);
          if (!user) return;

          // Use task rates if defined, otherwise fall back to user rates
          const sellRate = task.sellRate || user.sellRate || 0;
          const costRate = task.costRate || user.costRate || 0;

          // Calculate forecast hours and financials
          const forecastHours = getForecastHours(user.id, project.id, task.id);
          const forecastRevenue = forecastHours * sellRate;
          const forecastCost = forecastHours * costRate;

          // Get actual hours and financials from time entries
          const actualEntries = actuals.entries.filter(entry =>
            entry.projectName === project.name &&
            entry.taskName === task.name
          );

          const actualHours = actualEntries.reduce((sum, entry) => sum + entry.hours, 0);
          const actualRevenue = actualEntries.reduce((sum, entry) => sum + entry.revenue, 0);
          const actualCost = actualEntries.reduce((sum, entry) => sum + entry.cost, 0);

          // Add to project totals
          summary.forecast.revenue += forecastRevenue;
          summary.forecast.cost += forecastCost;
          summary.actual.revenue += actualRevenue;
          summary.actual.cost += actualCost;

          // Add task summary
          summary.tasks.push({
            taskId: task.id,
            taskName: task.name,
            userId: user.id,
            userName: user.name,
            forecast: {
              hours: forecastHours,
              revenue: forecastRevenue,
              cost: forecastCost
            },
            actual: {
              hours: actualHours,
              revenue: actualRevenue,
              cost: actualCost
            }
          });
        });
      });

      // Calculate gross margins
      summary.forecast.grossMargin = summary.forecast.revenue - summary.forecast.cost;
      summary.actual.grossMargin = summary.actual.revenue - summary.actual.cost;

      if (summary.forecast.revenue > 0 || summary.actual.revenue > 0) {
        summaries.set(project.id, summary);
      }
    });

    return Array.from(summaries.values());
  }, [forecasts, actuals, projects, clients, users, workingDays]);

  // Early return if no data
  if (projectSummaries.length === 0) {
    return (
      <div className="p-8 text-center text-gray-500">
        No data available for the selected period
      </div>
    );
  }

  const toggleProject = (projectId: string) => {
    setExpandedProjects(prev => {
      const next = new Set(prev);
      if (next.has(projectId)) {
        next.delete(projectId);
      } else {
        next.add(projectId);
      }
      return next;
    });
  };

  const getVarianceBadge = (variance: number, target: number) => {
    if (target === 0) return null;
    const percentage = (variance / target) * 100;
    if (Math.abs(percentage) < 5) {
      return <Badge variant="secondary">On Track</Badge>;
    }
    if (variance > 0) {
      return (
        <Badge variant="success" className="flex items-center gap-1">
          <TrendingUp className="h-3 w-3" />
          {percentage.toFixed(1)}% Above
        </Badge>
      );
    }
    return (
      <Badge variant="destructive" className="flex items-center gap-1">
        <TrendingDown className="h-3 w-3" />
        {Math.abs(percentage).toFixed(1)}% Below
      </Badge>
    );
  };

  return (
    <div className="bg-white shadow-sm ring-1 ring-gray-900/5 rounded-lg">
      <Table>
        <TableHeader>
          <tr>
            <Th className="w-8"></Th>
            <Th>Project</Th>
            <Th className="text-right">Forecast Revenue</Th>
            <Th className="text-right">Actual Revenue</Th>
            <Th className="text-right">Forecast Cost</Th>
            <Th className="text-right">Actual Cost</Th>
            <Th className="text-right">Forecast GM</Th>
            <Th className="text-right">Actual GM</Th>
            <Th>Variance</Th>
          </tr>
        </TableHeader>
        <TableBody>
          {projectSummaries.map(project => (
            <React.Fragment key={project.id}>
              <tr className="group">
                <Td>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => toggleProject(project.id)}
                    className="p-1 hover:bg-gray-100 rounded"
                  >
                    {expandedProjects.has(project.id) ? (
                      <ChevronDown className="h-4 w-4 text-gray-500" />
                    ) : (
                      <ChevronRight className="h-4 w-4 text-gray-500" />
                    )}
                  </Button>
                </Td>
                <Td>
                  <div>
                    <div className="font-medium">{project.name}</div>
                    <div className="text-sm text-gray-500">{project.clientName}</div>
                  </div>
                </Td>
                <Td className="text-right">{formatCurrency(project.forecast.revenue)}</Td>
                <Td className="text-right">{formatCurrency(project.actual.revenue)}</Td>
                <Td className="text-right">{formatCurrency(project.forecast.cost)}</Td>
                <Td className="text-right">{formatCurrency(project.actual.cost)}</Td>
                <Td className="text-right">{formatCurrency(project.forecast.grossMargin)}</Td>
                <Td className="text-right">{formatCurrency(project.actual.grossMargin)}</Td>
                <Td>
                  {getVarianceBadge(
                    project.actual.grossMargin - project.forecast.grossMargin,
                    project.forecast.grossMargin
                  )}
                </Td>
              </tr>

              {/* Expanded details */}
              {expandedProjects.has(project.id) && (
                <tr className="bg-gray-50">
                  <td></td>
                  <td colSpan={8} className="py-2 px-4">
                    <div className="space-y-4">
                      <Table>
                        <TableHeader>
                          <tr>
                            <Th>Task</Th>
                            <Th>User</Th>
                            <Th className="text-right">Forecast Hours</Th>
                            <Th className="text-right">Actual Hours</Th>
                            <Th className="text-right">Forecast Revenue</Th>
                            <Th className="text-right">Actual Revenue</Th>
                            <Th>Variance</Th>
                          </tr>
                        </TableHeader>
                        <TableBody>
                          {project.tasks.map((task, index) => (
                            <tr key={`${task.taskId}-${task.userId}`}>
                              <Td>{task.taskName}</Td>
                              <Td>{task.userName}</Td>
                              <Td className="text-right">{task.forecast.hours.toFixed(1)}</Td>
                              <Td className="text-right">{task.actual.hours.toFixed(1)}</Td>
                              <Td className="text-right">{formatCurrency(task.forecast.revenue)}</Td>
                              <Td className="text-right">{formatCurrency(task.actual.revenue)}</Td>
                              <Td>
                                {getVarianceBadge(
                                  task.actual.revenue - task.forecast.revenue,
                                  task.forecast.revenue
                                )}
                              </Td>
                            </tr>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  </td>
                </tr>
              )}
            </React.Fragment>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}