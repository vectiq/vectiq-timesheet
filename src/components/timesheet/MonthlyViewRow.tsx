import { useState } from 'react';
import { ChevronRight, ChevronDown, Clock, CheckCircle, XCircle, Undo2, AlertCircle } from 'lucide-react';
import { formatDate } from '@/lib/utils/date';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { useApprovals } from '@/lib/hooks/useApprovals';
import type { BadgeVariant } from '@/components/ui/Badge';

interface MonthlyViewRowProps {
  clientGroup: {
    client: { id: string; name: string };
    totalHours: number;
    projects: Map<string, {
      project: { id: string; name: string };
      totalHours: number;
      approvalStatus?: {
        status: 'unsubmitted' | 'pending' | 'approved' | 'rejected' | 'withdrawn';
        approvalId: string;
      };
      entries: Array<{
        date: string;
        hours: number;
        role: { name: string };
        approvalKey?: string;
      }>;
    }>;
  };
}

function ApprovalBadge({ status }: { status: 'unsubmitted' | 'pending' | 'approved' | 'rejected' | 'withdrawn' }) {
  let variant: BadgeVariant = 'secondary';
  let Icon = Clock;
  let text = 'Unsubmitted';

  switch (status) {
    case 'pending':
      variant = 'warning';
      Icon = Clock;
      text = 'Pending';
      break;
    case 'approved':
      variant = 'success';
      Icon = CheckCircle;
      text = 'Approved';
      break;
    case 'rejected':
      variant = 'destructive';
      Icon = AlertCircle;
      text = 'Rejected';
      break;
    case 'withdrawn':
      variant = 'secondary';
      Icon = Undo2;
      text = 'Withdrawn';
      break;
  }

  return (
    <Badge variant={variant} className="flex items-center gap-1.5">
      <Icon className="h-3 w-3" />
      <span>{text}</span>
    </Badge>
  );
}

export function MonthlyViewRow({ clientGroup }: MonthlyViewRowProps) {
  const [isExpanded, setIsExpanded] = useState(true);
  const { withdrawApproval, isWithdrawing } = useApprovals();

  const handleWithdraw = async (approvalId: string) => {
    if (window.confirm('Are you sure you want to withdraw this timesheet submission?')) {
      try {
        await withdrawApproval(approvalId);
      } catch (error) {
        console.error('Failed to withdraw approval:', error);
        alert('Failed to withdraw approval');
      }
    }
  };

  return (
    <div className="divide-y divide-gray-100">
      {/* Client Row */}
      <div className="p-4 flex items-center justify-between hover:bg-gray-50">
        <div className="flex items-center">
          <Button
            variant="ghost"
            size="sm"
            className="mr-2"
            onClick={() => setIsExpanded(!isExpanded)}
          >
            {isExpanded ? (
              <ChevronDown className="h-4 w-4" />
            ) : (
              <ChevronRight className="h-4 w-4" />
            )}
          </Button>
          <span className="font-medium">{clientGroup.client.name}</span>
        </div>
        <span className="text-sm">
          <span className="text-gray-500">Total Hours:</span>
          <span className="ml-1 font-medium">{clientGroup.totalHours.toFixed(2)}</span>
        </span>
      </div>

      {/* Project Details */}
      {isExpanded && Array.from(clientGroup.projects.values()).map(projectGroup => (
        <div key={projectGroup.project.id} className="pl-12 divide-y divide-gray-100">
          {/* Project Summary */}
          <div className="p-4 bg-gray-50 flex justify-between items-center gap-4">
            <div className="flex items-center gap-3">
              <span className="font-medium">{projectGroup.project.name}</span>
              {projectGroup.approvalStatus && (
                <div className="flex items-center gap-2">
                  <ApprovalBadge status={projectGroup.approvalStatus.status} />
                  {projectGroup.approvalStatus.status === 'pending' && (
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => handleWithdraw(projectGroup.approvalStatus.approvalId)}
                      disabled={isWithdrawing}
                      className="ml-2"
                    >
                      <Undo2 className="h-4 w-4 mr-1" />
                      Withdraw
                    </Button>
                  )}
                </div>
              )}
            </div>
            <span className="text-sm">
              <span className="text-gray-500">Total Hours:</span>
              <span className="ml-1 font-medium">{projectGroup.totalHours.toFixed(2)}</span>
            </span>
          </div>

          {/* Time Entries */}
          <div className="divide-y divide-gray-100">
            {projectGroup.entries.map((entry, index) => (
              <div key={index} className="p-4 pl-8 flex justify-between items-center text-sm">
                <div>
                  <span className="text-gray-500">{formatDate(entry.date)}</span>
                  <span className="mx-2">·</span>
                  <span>{entry.role.name}</span>
                </div>
                <span>
                  <span className="text-gray-500">Hours:</span>
                  <span className="ml-1 font-medium">{entry.hours.toFixed(2)}</span>
                </span>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}