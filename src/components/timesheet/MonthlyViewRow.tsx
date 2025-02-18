import { useState } from 'react';
import { ChevronRight, ChevronDown, Clock, CheckCircle, XCircle, Undo2, AlertCircle, Send } from 'lucide-react';
import { formatDate } from '@/lib/utils/date';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { useApprovals } from '@/lib/hooks/useApprovals';
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogAction,
  AlertDialogCancel,
} from '@/components/ui/AlertDialog';
import type { BadgeVariant } from '@/components/ui/Badge';

interface MonthlyViewRowProps {
  clientGroup: {
    client: { id: string; name: string };
    totalHours: number;
    projects: Map<string, {
      project: { id: string; name: string; requiresApproval: boolean };
      requiresApproval?: boolean;
      totalHours: number;
      approvalStatus?: {
        status: 'unsubmitted' | 'pending' | 'approved' | 'rejected' | 'withdrawn';
        approvalId: string;
      };
      entries: Array<{
        date: string;
        hours: number;
        task: { name: string };
        approvalKey?: string;
      }>;
    }>;
  };
  dateRange: {
    start: Date;
    end: Date;
  };
  userId: string;
}

function ApprovalBadge({ status, requiresApproval }: { 
  status: 'unsubmitted' | 'pending' | 'approved' | 'rejected' | 'withdrawn';
  requiresApproval: boolean;
}) {
  if (!requiresApproval) {
    return (
      <Badge variant="secondary" className="flex items-center gap-1.5">
        <ChevronRight className="h-3 w-3" />
        <span>Approval Not Required</span>
      </Badge>
    );
  }

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
    default:
      variant = 'default';
      Icon = ChevronRight;
      text = 'Unsubmitted';
      break;
  }

  return (
    <Badge variant={variant} className="flex items-center gap-1.5">
      <Icon className="h-3 w-3" />
      <span>{text}</span>
    </Badge>
  );
}

export function MonthlyViewRow({ clientGroup, dateRange, userId }: MonthlyViewRowProps) {
  const [isExpanded, setIsExpanded] = useState(true);
  const [confirmationDialog, setConfirmationDialog] = useState<{
    isOpen: boolean;
    type: 'submit' | 'withdraw';
    projectGroup?: any;
    approvalId?: string;
  }>({ isOpen: false, type: 'submit' });
  const { withdrawApproval, isWithdrawing, submitApproval } = useApprovals();
  const startDate = format(dateRange.start, 'yyyy-MM-dd');
  const endDate = format(dateRange.end, 'yyyy-MM-dd');


  const handleSubmitApproval = async (projectGroup) => {
    setConfirmationDialog({
      isOpen: true,
      type: 'submit',
      projectGroup
    });
  };

  const handleConfirmSubmit = async () => {
    try {
      await submitApproval({
        project: confirmationDialog.projectGroup.project,
        client: clientGroup.client,
        dateRange: dateRange,
        entries: confirmationDialog.projectGroup.entries,
        userId: userId
      });
    } catch (error) {
      console.error('Failed to submit approval:', error);
      alert('Failed to submit timesheet for approval');
    } finally {
      setConfirmationDialog({ isOpen: false, type: 'submit' });
    }
  };

  const handleWithdraw = async (approvalId: string) => {
    setConfirmationDialog({
      isOpen: true,
      type: 'withdraw',
      approvalId
    });
  };

  const handleConfirmWithdraw = async () => {
    try {
      await withdrawApproval(confirmationDialog.approvalId);
    } catch (error) {
      console.error('Failed to withdraw approval:', error);
      alert('Failed to withdraw approval');
    } finally {
      setConfirmationDialog({ isOpen: false, type: 'withdraw' });
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
                  {/* Status Badge */}
                  <ApprovalBadge 
                    status={projectGroup.approvalStatus.status}
                    requiresApproval={projectGroup.project.requiresApproval}
                  />
                  {/* Submit/Withdraw Buttons */}
                  {projectGroup.project.requiresApproval && (
                    <>
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
                      {(projectGroup.approvalStatus.status === 'unsubmitted' ||
                        projectGroup.approvalStatus.status === 'rejected' ||
                        projectGroup.approvalStatus.status === 'withdrawn') && (
                          <Button
                            variant="secondary"
                            size="sm"
                            onClick={() => handleSubmitApproval(projectGroup)}
                            className="ml-2"
                          >
                            <Send className="h-4 w-4 mr-1" />
                            Submit for Approval
                          </Button>
                      )}
                    </>
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
                  <span>{entry.task.name}</span>
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
      
      <AlertDialog 
        open={confirmationDialog.isOpen} 
        onOpenChange={(open) => setConfirmationDialog(prev => ({ ...prev, isOpen: open }))}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {confirmationDialog.type === 'submit' 
                ? 'Submit Timesheet for Approval'
                : 'Withdraw Timesheet Submission'
              }
            </AlertDialogTitle>
            <AlertDialogDescription>
              {confirmationDialog.type === 'submit'
                ? 'Are you sure you want to submit this timesheet for approval? This will notify the project approver.'
                : 'Are you sure you want to withdraw this timesheet submission? You will need to resubmit for approval.'
              }
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmationDialog.type === 'submit' ? handleConfirmSubmit : handleConfirmWithdraw}
            >
              {confirmationDialog.type === 'submit' ? 'Submit' : 'Withdraw'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}