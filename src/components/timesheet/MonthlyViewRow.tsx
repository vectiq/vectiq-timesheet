import { useState } from 'react';
import { ChevronRight, ChevronDown, Clock, CheckCircle, XCircle, Undo2, AlertCircle, Send, FolderKanban } from 'lucide-react';
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
  const [isClientExpanded, setIsClientExpanded] = useState(true);
  const [expandedProjects, setExpandedProjects] = useState<Set<string>>(new Set());
  const [confirmationDialog, setConfirmationDialog] = useState<{
    isOpen: boolean;
    type: 'submit' | 'withdraw';
    projectGroup?: any;
    approvalId?: string;
  }>({ isOpen: false, type: 'submit' });
  const [submittingProjectId, setSubmittingProjectId] = useState<string | null>(null);
  const { withdrawApproval, isWithdrawing, submitApproval, isSubmitting } = useApprovals();

  const handleSubmitApproval = async (projectGroup) => {
    setConfirmationDialog({
      isOpen: true,
      type: 'submit',
      projectGroup
    });
  };

  const handleConfirmSubmit = async () => {
    try {
      setSubmittingProjectId(confirmationDialog.projectGroup.project.id);
      const projectId = confirmationDialog.projectGroup.project.id;
      
      await submitApproval({
        project: confirmationDialog.projectGroup.project,
        client: clientGroup.client,
        dateRange: dateRange,
        entries: confirmationDialog.projectGroup.entries,
        userId: userId
      });
      
      // Update local state to reflect the new pending status
      clientGroup.projects.set(projectId, {
        ...confirmationDialog.projectGroup,
        approvalStatus: {
          status: 'pending',
          approvalId: crypto.randomUUID() // This will be replaced when the page refreshes
        }
      });
      
    } catch (error) {
      console.error('Failed to submit approval:', error);
      alert('Failed to submit timesheet for approval');
    } finally {
      setSubmittingProjectId(null);
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

  return (
    <div className="divide-y divide-gray-100">
      {/* Client Row */}
      <div className="p-4 flex items-center justify-between hover:bg-gray-50">
        <div className="flex items-center">
          <Button
            variant="ghost"
            size="sm"
            className="mr-2"
            onClick={() => setIsClientExpanded(!isClientExpanded)}
          >
            {isClientExpanded ? (
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
      {isClientExpanded && Array.from(clientGroup.projects.entries()).map(([projectId, projectGroup]) => {
        const isProjectExpanded = expandedProjects.has(projectGroup.project.id);
        return ( 
        <div key={`${clientGroup.client.id}-${projectId}`} className="pl-12 divide-y divide-gray-100">
          {/* Project Summary */}
          <div className="p-4 bg-gray-50 flex justify-between items-center gap-4">
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                className="mr-2"
                onClick={() => toggleProject(projectGroup.project.id)}
              >
                {isProjectExpanded ? (
                  <ChevronDown className="h-4 w-4" />
                ) : (
                  <ChevronRight className="h-4 w-4" />
                )}
              </Button>
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
                           disabled={submittingProjectId === projectGroup.project.id}
                            className="ml-2"
                          >
                           {submittingProjectId === projectGroup.project.id ? (
                             <>
                               <span className="h-4 w-4 mr-1 animate-spin rounded-full border-2 border-gray-300 border-t-indigo-600" />
                             <span>Submit for Approval</span>
                             </>
                           ) : (
                            <>
                            <Send className="h-4 w-4 mr-1" />
                            <span>Submit for Approval</span>
                            </>
                           )}
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
          {isProjectExpanded && <div className="divide-y divide-gray-100">
            {projectGroup.entries.map((entry) => (
              <div 
                key={`${clientGroup.client.id}-${projectId}-${entry.date}-${entry.task.name}`} 
                className="p-4 pl-8 flex justify-between items-center text-sm"
              >
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
          </div>}
        </div>
      );
      })}
      
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
              disabled={isSubmitting || isWithdrawing}
              onClick={confirmationDialog.type === 'submit' ? handleConfirmSubmit : handleConfirmWithdraw}
            >
              {confirmationDialog.type === 'submit' ? (
                isSubmitting ? (
                  <>
                    <span className="h-4 w-4 mr-1 animate-spin rounded-full border-2 border-gray-300 border-t-white" />
                    Submitting...
                  </>
                ) : 'Submit'
              ) : (
                isWithdrawing ? (
                  <>
                    <span className="h-4 w-4 mr-1 animate-spin rounded-full border-2 border-gray-300 border-t-white" />
                    Withdrawing...
                  </>
                ) : 'Withdraw'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}