import { format } from 'date-fns';
import { Card } from '@/components/ui/Card';
import { MonthlyViewRow } from './MonthlyViewRow';
import { useTimeEntries } from '@/lib/hooks/useTimeEntries';
import { useClients } from '@/lib/hooks/useClients';
import { useProjects } from '@/lib/hooks/useProjects';
import { useApprovals } from '@/lib/hooks/useApprovals'; 
import { useUsers } from '@/lib/hooks/useUsers';
import { useEffect, useState } from 'react';
import type { Project, ProjectWithStatus, User } from '@/types';
import { app } from '@/lib/firebase';

interface MonthlyViewProps {
  userId: string;
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
    }>;
    }
  >;
}

export function MonthlyView({ dateRange, userId }: MonthlyViewProps) {
  const { timeEntries } = useTimeEntries({ userId, dateRange });
  const { clients } = useClients();
  const { projects } = useProjects();
  const { approvals } = useApprovals(); 
  const startDate = format(dateRange.start, 'yyyy-MM-dd');
  const endDate = format(dateRange.end, 'yyyy-MM-dd');

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
      const approval = approvals?.find(a => a.project?.id === project.id && a.startDate === startDate && a.endDate === endDate)
      clientGroup.projects.set(projectKey, {
        project,
        approvalStatus: {
          status: approval?.status || 'unsubmitted',
          approvalId: approval?.id || ''
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


  return (
    <Card>
      <div className="divide-y divide-gray-200">
        {Array.from(groups.values()).map(clientGroup => (
          <MonthlyViewRow
            key={clientGroup.client.id}
            clientGroup={clientGroup}
            dateRange={dateRange}
            userId={userId}
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