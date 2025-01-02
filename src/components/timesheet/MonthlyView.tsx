import { useMemo, useCallback } from 'react';
import { format } from 'date-fns';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Send } from 'lucide-react';
import { MonthlyViewRow } from './MonthlyViewRow';
import { useTimeEntries } from '@/lib/hooks/useTimeEntries';
import { useClients } from '@/lib/hooks/useClients';
import { useProjects } from '@/lib/hooks/useProjects';
import { useRoles } from '@/lib/hooks/useRoles';
import type { Project } from '@/types';

interface MonthlyViewProps {
  dateRange: {
    start: Date;
    end: Date;
    onApprovalClick: () => void;
  };
}

export function MonthlyView({ dateRange, onApprovalClick }: MonthlyViewProps) {
  const { timeEntries } = useTimeEntries({ dateRange });
  const { approvals } = useApprovals();
  const { clients } = useClients();
  const { projects } = useProjects();
  const { roles } = useRoles();

  // Group entries by client and project
  const groupedEntries = useMemo(() => {
    const groups = new Map();
    const startDate = format(dateRange.start, 'yyyy-MM-dd');
    const endDate = format(dateRange.end, 'yyyy-MM-dd');

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
          projects: new Map(),
        });
      }

      // Initialize project group if it doesn't exist
      const clientGroup = groups.get(clientKey);
      if (!clientGroup.projects.has(projectKey)) {
        const approval = approvals.find(a => 
          a.project.id === project.id && 
          a.period.startDate === startDate && 
          a.period.endDate === endDate
        );

        clientGroup.projects.set(projectKey, {
          project,
          approvalStatus: {
            status: approval ? approval.status : 'unsubmitted',
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
        role,
        compositeKey: entry.compositeKey
      });

      // Update totals
      projectGroup.totalHours += entry.hours;
      clientGroup.totalHours += entry.hours;
    });

    return groups;
  }, [timeEntries, clients, projects, roles]);

  // Calculate grand totals
  const totals = useMemo(() => {
    let hours = 0;

    groupedEntries.forEach(group => {
      hours += group.totalHours;
    });

    return { hours };
  }, [groupedEntries]);
  // Check if any projects have pending/approved entries
  const hasLockedProjects = useMemo(() => {
    let locked = false;
    groupedEntries.forEach(group => {
      group.projects.forEach(project => {
        if (project.approvalStatus?.status === 'pending' || 
            project.approvalStatus?.status === 'approved') {
          locked = true;
        }
      });
    });
    return locked;
  }, [groupedEntries]);

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
          <Button onClick={onApprovalClick}>
            <Send className="h-4 w-4 mr-2" />
            Submit for Approval
          </Button>
        </div>
      </div>
    </Card>
  );
}