import { useState } from 'react';
import { format } from 'date-fns';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Send } from 'lucide-react';
import { MonthlyViewRow } from './MonthlyViewRow';
import { useTimeEntries } from '@/lib/hooks/useTimeEntries';
import { useClients } from '@/lib/hooks/useClients';
import { useProjects } from '@/lib/hooks/useProjects';
import { useTasks } from '@/lib/hooks/useTasks';
import { useApprovals } from '@/lib/hooks/useApprovals'; 
import { useUsers } from '@/lib/hooks/useUsers';
import type { Project, ProjectWithStatus, User } from '@/types';

interface MonthlyViewProps {
  dateRange: {
    start: Date;
    end: Date;
  };
}

interface GroupedData {
  client: { id: string; name: string };
  totalHours: number;
  projects: Map<
    string,
    {
    project: { id: string; name: string };
    approvalStatus?: {
      status: 'unsubmitted' | 'pending' | 'approved' | 'rejected' | 'withdrawn';
      approvalId: string;
    };
    totalHours: number;
    entries: Array<{
      date: string;
      hours: number;
      task: { name: string };
      compositeKey?: string;
    }>;
    }
  >;
}

export function MonthlyView({ dateRange }: MonthlyViewProps) {
  const { effectiveUser } = useUsers();
  const { timeEntries } = useTimeEntries({ dateRange });
  const { clients } = useClients();
  const { projects } = useProjects();
  const { useApprovalStatus } = useApprovals(); 
  const startDate = format(dateRange.start, 'yyyy-MM-dd');
  const endDate = format(dateRange.end, 'yyyy-MM-dd');

  // Filter projects based on user assignments
  const userProjects = projects.filter(project =>
    effectiveUser?.projectAssignments?.some(a => a.projectId === project.id)
  );

  // Get approval statuses for all projects
  const approvalStatusQueries = userProjects
    .filter(p => p.requiresApproval)
    .map(project => ({
      projectId: project.id,
      query: useApprovalStatus(project.id, effectiveUser?.id, startDate, endDate)
    }));

  // Combine all status results into a map
  const approvalStatusMap = new Map();
  approvalStatusQueries.forEach(({ projectId, query }) => {
    if (query.data) {
      approvalStatusMap.set(projectId, query.data);
    }
  });

  // Group entries by client and project
  const groups = new Map<string, GroupedData>();
  timeEntries.forEach(entry => {
    const client = clients.find(c => c.id === entry.clientId);
    const project = projects.find(p => p.id === entry.projectId);
    const projectTask = project?.tasks?.find(r => r.id === entry.taskId);

    if (!client || !project || !projectTask) return;

    const clientKey = client.id;
    const projectKey = `${client.id}-${project.id}`;

    // Initialize client group if it doesn't exist
    if (!groups.has(clientKey)) {
      groups.set(clientKey, {
        client,
        totalHours: 0,
        projects: new Map<string, GroupedData['projects'] extends Map<string, infer V> ? V : never>(),
      });
    }

    // Initialize project group if it doesn't exist
    const clientGroup = groups.get(clientKey);
    if (!clientGroup.projects.has(projectKey)) {
      const approval = approvalStatusMap.get(project.id);

      clientGroup.projects.set(projectKey, {
        project,
        approvalStatus: {
          status: approval?.status || 'unsubmitted',
          approvalId: approval?.approvalId || ''
        },
        totalHours: 0,
        entries: [],
      });
    }

    // Add entry to project group
    const projectGroup = clientGroup.projects.get(projectKey);
    projectGroup.entries.push({
      ...entry,
      task: { name: projectTask.name },
      compositeKey: entry.compositeKey
    });

    // Update totals
    projectGroup.totalHours += entry.hours;
    clientGroup.totalHours += entry.hours;
  });

  // Calculate grand totals
  let totalHours = 0;
  groups.forEach(group => {
    totalHours += group.totalHours;
  });

  // Get projects that need approval
  const projectsNeedingApproval = (() => {
    if (!effectiveUser) return [];

    const statuses: ProjectWithStatus[] = [];

    for (const project of userProjects) {
      // Only include projects that:
      // 1. Require approval
      // 2. Have time entries
      // 3. Don't already have a pending or approved status
      const projectEntries = timeEntries.filter(entry => entry.projectId === project.id);
      if (!project.requiresApproval || projectEntries.length === 0) continue;

      const client = clients.find(c => c.id === project.clientId);
      if (!client) continue;

      const totalHours = projectEntries.reduce((sum, entry) => sum + entry.hours, 0);
      const approvalStatus = approvalStatusMap.get(project.id);

      // Skip if already pending or approved
      if (approvalStatus?.status === 'pending' || approvalStatus?.status === 'approved') continue;

      statuses.push({
        id: project.id,
        name: project.name,
        clientName: client.name,
        totalHours,
        status: approvalStatus?.status || 'unsubmitted'
      });
    }

    return statuses;
  })();

  return (
    <Card>
      <div className="divide-y divide-gray-200">
        {Array.from(groups.values()).map(clientGroup => (
          <MonthlyViewRow
            key={clientGroup.client.id}
            clientGroup={clientGroup}
          />
        ))}
      </div>

      {/* Monthly Totals */}
      <div className="p-4 bg-gray-50 border-t border-gray-200">
        <div className="flex justify-between items-center">
          <div className="text-sm">
            <span className="font-medium text-gray-700">Monthly Total:</span>
            <span className="ml-2 font-semibold text-gray-900">
              {totalHours.toFixed(2)} hours
            </span>
          </div>
        </div>
      </div>
    </Card>
  );
}