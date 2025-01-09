import { useState } from 'react';
import { format } from 'date-fns';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Send } from 'lucide-react';
import { MonthlyViewRow } from './MonthlyViewRow';
import { useTimeEntries } from '@/lib/hooks/useTimeEntries';
import { useClients } from '@/lib/hooks/useClients';
import { useProjects } from '@/lib/hooks/useProjects';
import { useRoles } from '@/lib/hooks/useRoles';
import { useApprovals } from '@/lib/hooks/useApprovals'; 
import { useUsers } from '@/lib/hooks/useUsers';
import type { Project, ProjectWithStatus } from '@/types';

interface MonthlyViewProps {
  dateRange: {
    start: Date;
    end: Date;
  };
  userId?: string;
  onApprovalClick: (projects: ProjectWithStatus[]) => void;
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
      role: { name: string };
      compositeKey?: string;
    }>;
    }
  >;
}

export function MonthlyView({ dateRange, userId, onApprovalClick }: MonthlyViewProps) {
  const { timeEntries } = useTimeEntries({ dateRange, userId });
  const { users } = useUsers();
  const selectedUser = users.find(u => u.id === userId);
  const { clients } = useClients();
  const { projects } = useProjects();
  const { roles } = useRoles();
  const { useApprovalStatus } = useApprovals(); 
  const startDate = format(dateRange.start, 'yyyy-MM-dd');
  const endDate = format(dateRange.end, 'yyyy-MM-dd');

  // Filter projects based on user assignments
  const userProjects = projects.filter(project => 
    selectedUser?.projectAssignments?.some(a => a.projectId === project.id)
  );

  // Get approval statuses for all projects
  const approvalStatusQueries = userProjects
    .filter(p => p.requiresApproval)
    .map(project => ({
      projectId: project.id,
      query: useApprovalStatus(project.id, userId, startDate, endDate)
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
    const projectRole = project?.roles?.find(r => r.id === entry.roleId);

    if (!client || !project || !projectRole) return;

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
      role: { name: projectRole.name },
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
    if (!userId || !selectedUser) return [];

    const projectsWithEntries = new Set<string>(timeEntries.map(entry => entry.projectId));
    const userProjectIds = new Set(selectedUser?.projectAssignments?.map(a => a.projectId) || []);
    const statuses: ProjectWithStatus[] = [];

    for (const project of userProjects) {
      if (!projectsWithEntries.has(project.id) || !project.requiresApproval || !userProjectIds.has(project.id)) continue;

      const client = clients.find(c => c.id === project.clientId);
      if (!client) continue;

      const projectEntries = timeEntries.filter(entry => entry.projectId === project.id);
      const totalHours = projectEntries.reduce((sum, entry) => sum + entry.hours, 0);

      if (totalHours === 0) continue;

      const approvalStatus = approvalStatusMap.get(project.id);

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

  const handleApprovalClick = () => {
    if (!userId) return;
    onApprovalClick(projectsNeedingApproval);
  };

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
          <Button 
            onClick={handleApprovalClick}
            disabled={projectsNeedingApproval.length === 0}
            className={projectsNeedingApproval.length === 0 ? "opacity-50 cursor-not-allowed" : ""}
            title={projectsNeedingApproval.length === 0 ? "No time entries require approval for this period" : undefined}
          >
            <Send className="h-4 w-4 mr-2" />
            Submit for Approval
          </Button>
        </div>
      </div>
    </Card>
  );
}