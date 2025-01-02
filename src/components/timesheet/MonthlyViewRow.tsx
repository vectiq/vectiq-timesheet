import { useState } from 'react';
import { ChevronRight, ChevronDown, Clock, CheckCircle, XCircle } from 'lucide-react';
import { formatDate } from '@/lib/utils/date';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import type { BadgeVariant } from '@/components/ui/Badge';

interface ApprovalStatus {
  status: 'unsubmitted' | 'pending' | 'approved' | 'rejected';
  approvalKey: string;
}

interface MonthlyViewRowProps {
  clientGroup: {
    client: { id: string; name: string };
    totalHours: number;
    projects: Map<string, {
      project: { id: string; name: string };
      totalHours: number;
      approvalStatus?: ApprovalStatus;
      entries: Array<{
        date: string;
        hours: number;
        role: { name: string };
        approvalKey?: string;
      }>;
    }>;
  };
}

function ApprovalBadge({ status }: { status: 'unsubmitted' | 'pending' | 'approved' | 'rejected' }) {
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
      Icon = XCircle;
      text = 'Rejected';
      break;
  }

  return (
    <Badge variant={variant} className="flex items-center gap-1">
      <Icon className="h-3 w-3" />
      <span>{text}</span>
    </Badge>
  );
}

export function MonthlyViewRow({ clientGroup }: MonthlyViewRowProps) {
  const [isExpanded, setIsExpanded] = useState(false);

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
                <ApprovalBadge status={projectGroup.approvalStatus.status} />
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