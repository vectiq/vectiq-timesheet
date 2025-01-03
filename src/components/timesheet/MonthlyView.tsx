import { useMemo, useEffect } from 'react';
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
import { auth } from '@/lib/firebase';
import type { Project, ProjectWithStatus } from '@/types';

interface MonthlyViewProps {
  dateRange: {
    start: Date;
    end: Date;
  };
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

export function MonthlyView({ dateRange, onApprovalClick }: MonthlyViewProps) {
  const { timeEntries } = useTimeEntries({ dateRange });
  const { clients } = useClients();
  const { projects } = useProjects();
  const { roles } = useRoles();
  const { approvals } = useApprovals();
  const userId = auth.currentUser?.uid;

  const startDate = format(dateRange.start, 'yyyy-MM-dd');
  const endDate = format(dateRange.end, 'yyyy-MM-dd');

  // Group entries by client and project
  const groupedEntries = useMemo(() => {
    const groups = new Map<string, GroupedData>();

    // Find approvals for the current period
    const periodApprovals = approvals.filter(approval => 
      approval.period.startDate === startDate &&
      approval.period.endDate === endDate &&
      approval.userId === userId
    );

    timeEntries.forEach(entry => {
      const client = clients.find(c => c.id === entry.clientId);
      const project = projects.find(p => p.id === entry.projectId);
      const role = roles.find(r => r.id === entry.roleId);

      if (!client || !project || !role) return;

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
        // Find approval for this project in the current period
        const approval = periodApprovals.find(a => 
          a.project.id === project.id && 
          a.period.startDate === startDate && 
          a.period.endDate === endDate
        );
        
        clientGroup.projects.set(projectKey, {
          project,
          approvalStatus: approval ? {
            status: approval.status,
            approvalId: approval.id
          } : undefined,
          totalHours: 0,
          entries: [],
        });
      }

      // Add entry to project group
      const projectGroup = clientGroup.projects.get(projectKey);
      projectGroup.entries.push({
        ...entry,
        role,
        compositeKey: entry.compositeKey
      });

      // Update totals
      if (projectGroup) {
        projectGroup.totalHours += entry.hours;
        clientGroup.totalHours += entry.hours;
      }
    });

    return groups;
  }, [timeEntries, clients, projects, roles, approvals, startDate, endDate, userId]);

  // Calculate grand totals
  const totals = useMemo(() => {
    let hours = 0.0;

    groupedEntries.forEach(group => {
      hours += group.totalHours;
    });

    return { hours };
  }, [groupedEntries]);
  
  const handleApprovalClick = () => {
    const projectsWithStatus = Array.from(groupedEntries.values())
      .flatMap(clientGroup => 
        Array.from(clientGroup.projects.values())
          .filter(projectGroup => projectGroup.project.requiresApproval)
          .map(projectGroup => ({
            id: projectGroup.project.id,
            name: projectGroup.project.name,
            clientName: clientGroup.client.name,
            totalHours: projectGroup.totalHours,
            status: projectGroup.approvalStatus?.status || 'unsubmitted'
          }))
      );
    onApprovalClick(projectsWithStatus);
  };

  return (
    <Card>
      <div className="divide-y divide-gray-200">
        {Array.from(groupedEntries.values()).map(clientGroup => (
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
              {totals.hours.toFixed(2)} hours
            </span>
          </div>
          <Button onClick={handleApprovalClick}>
            <Send className="h-4 w-4 mr-2" />
            Submit for Approval
          </Button>
        </div>
      </div>
    </Card>
  );
}