import { format } from 'date-fns';
import { Card } from '@/components/ui/Card';
import { useTimeEntries } from '@/lib/hooks/useTimeEntries';
import { useClients } from '@/lib/hooks/useClients';
import { useProjects } from '@/lib/hooks/useProjects';
import { useApprovals } from '@/lib/hooks/useApprovals'; 
import { useUsers } from '@/lib/hooks/useUsers';
import { useEffect, useState } from 'react';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Clock, CheckCircle, XCircle, AlertCircle, Send, Undo2 } from 'lucide-react';
import { AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter, AlertDialogAction, AlertDialogCancel } from '@/components/ui/AlertDialog';
import { cn } from '@/lib/utils/styles';
import { formatDate } from '@/lib/utils/date';
import type { Project, ProjectWithStatus } from '@/types';

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
      project: { id: string; name: string; requiresApproval: boolean };
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
  const { approvals, submitApproval, withdrawApproval, isSubmitting } = useApprovals(); 
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [confirmationDialog, setConfirmationDialog] = useState<{
    isOpen: boolean;
    type: 'submit' | 'withdraw';
    projectGroup?: any;
    approvalId?: string;
  }>({ isOpen: false, type: 'submit' });
  
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
        projects: new Map(),
      });
    }

    // Initialize project group if it doesn't exist
    const clientGroup = groups.get(clientKey);
    if (!clientGroup.projects.has(projectKey)) {
      const approval = approvals?.find(a => 
        a.project?.id === project.id && 
        a.startDate === startDate && 
        a.endDate === endDate
      );
      
      clientGroup.projects.set(projectKey, {
        project,
        approvalStatus: {
          status: approval?.status || 'unsubmitted',
          approvalId: approval?.id || '',
          rejectionReason: approval?.rejectionReason
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

  // Set first project as selected if none selected
  useEffect(() => {
    if (!selectedProjectId && groups.size > 0) {
      const firstClient = groups.values().next().value;
      if (firstClient && firstClient.projects.size > 0) {
        const firstProject = firstClient.projects.values().next().value;
        setSelectedProjectId(`${firstClient.client.id}-${firstProject.project.id}`);
      }
    }
  }, [groups, selectedProjectId]);

  const handleSubmitApproval = async (projectGroup) => {
    setConfirmationDialog({
      isOpen: true,
      type: 'submit',
      projectGroup
    });
  };

  const handleConfirmSubmit = async () => {
    try {
      const { projectGroup } = confirmationDialog;
      await submitApproval({
        project: projectGroup.project,
        client: groups.get(projectGroup.project.clientId).client,
        dateRange: dateRange,
        entries: projectGroup.entries,
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

  // Calculate grand totals
  let totalHours = 0;
  groups.forEach(group => {
    totalHours += group.totalHours;
  });

  // Get all projects for tabs
  const allProjects = Array.from(groups.values()).flatMap(group => 
    Array.from(group.projects.values())
  );

  // Get currently selected project
  const selectedProject = selectedProjectId ? 
    allProjects.find(p => `${p.project.clientId}-${p.project.id}` === selectedProjectId) : 
    null;

  return (
    <Card>
      {/* Project Tabs */}
      <div className="border-b border-gray-200">
        <div className="flex overflow-x-auto">
          {allProjects.map(projectGroup => {
            const projectKey = `${projectGroup.project.clientId}-${projectGroup.project.id}`;
            const isSelected = selectedProjectId === projectKey;
            const client = groups.get(projectGroup.project.clientId)?.client;

            return (
              <button
                key={projectKey}
                onClick={() => setSelectedProjectId(projectKey)}
                className={cn(
                  "flex-none px-4 py-2 text-sm font-medium border-b-2 whitespace-nowrap min-w-[200px]",
                  isSelected
                    ? "border-indigo-500 text-indigo-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                )}
              >
                <div className="flex items-center gap-2">
                  <span>{projectGroup.project.name}</span>
                  <span className="font-medium">({projectGroup.totalHours.toFixed(1)}h)</span>
                  <Badge variant={
                    !projectGroup.project.requiresApproval ? 'secondary' :
                    projectGroup.approvalStatus?.status === 'approved' ? 'success' :
                    projectGroup.approvalStatus?.status === 'pending' ? 'warning' :
                    projectGroup.approvalStatus?.status === 'rejected' ? 'destructive' :
                    'default'
                  }>
                    {projectGroup.project.requiresApproval ? 
                      projectGroup.approvalStatus?.status.charAt(0).toUpperCase() + 
                      projectGroup.approvalStatus?.status.slice(1) : 
                      'No Approval Required'
                    }
                  </Badge>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Selected Project Content */}
      {selectedProject && (
        <div className="p-4">
          {/* Rejection Message */}
          {selectedProject.approvalStatus?.status === 'rejected' && (
            <div className="mb-2">
              <Card className="bg-red-50 border-red-100">
                <div className="py-2 px-4">
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0">
                      <XCircle className="h-5 w-5 text-red-500" />
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-red-800">Timesheet Rejected</h3>
                      <p className="mt-1 text-sm text-red-700">
                        {selectedProject.approvalStatus?.rejectionReason || 'No reason provided'}
                      </p>
                    </div>
                  </div>
                </div>
              </Card>
            </div>
          )}

          <div className="flex justify-between items-center mb-4">
            <div>
              <h3 className="text-lg font-medium text-gray-900">
                {selectedProject.project.name}
              </h3>
              <p className="text-sm text-gray-500">
                {groups.get(selectedProject.project.clientId)?.client.name}
              </p>
            </div>
            
            {selectedProject.project.requiresApproval && (
              <div className="flex items-center gap-2">
                <Badge variant={
                  !selectedProject.project.requiresApproval ? 'secondary' :
                  selectedProject.approvalStatus?.status === 'approved' ? 'success' :
                  selectedProject.approvalStatus?.status === 'pending' ? 'warning' :
                  selectedProject.approvalStatus?.status === 'rejected' ? 'destructive' :
                  'default'
                }>
                  {selectedProject.project.requiresApproval ? 
                    selectedProject.approvalStatus?.status.charAt(0).toUpperCase() + 
                    selectedProject.approvalStatus?.status.slice(1) : 
                    'No Approval Required'
                  }
                </Badge>
                {selectedProject.approvalStatus?.status === 'pending' && (
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => handleWithdraw(selectedProject.approvalStatus.approvalId)}
                  >
                    <Undo2 className="h-4 w-4 mr-1" />
                    Withdraw
                  </Button>
                )}
                {(selectedProject.approvalStatus?.status === 'unsubmitted' ||
                  selectedProject.approvalStatus?.status === 'rejected' ||
                  selectedProject.approvalStatus?.status === 'withdrawn') && (
                    <Button
                      variant="secondary"
                      size="sm"
                      disabled={isSubmitting}
                      onClick={() => handleSubmitApproval(selectedProject)}
                    >
                      {isSubmitting ? (
                        <>
                          <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-gray-700" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Submitting...
                        </>
                      ) : (
                        <>
                          <Send className="h-4 w-4 mr-1" />
                          Submit for Approval
                        </>
                      )}
                    </Button>
                )}
              </div>
            )}
          </div>

          <div className="space-y-4">
            {selectedProject.entries
              .sort((a, b) => a.date.localeCompare(b.date))
              .map((entry, index) => (
                <div 
                  key={index}
                  className="flex justify-between items-center p-3 bg-gray-50 rounded-lg"
                >
                  <div className="flex items-center gap-4">
                    <div className="text-sm text-gray-500">
                      {formatDate(entry.date)}
                    </div>
                    <div className="text-sm font-medium">
                      {entry.task.name}
                    </div>
                  </div>
                  <div className="font-medium">
                    {entry.hours.toFixed(1)} hours
                  </div>
                </div>
              ))}
          </div>

          <div className="mt-4 pt-4 border-t border-gray-200">
            <div className="flex justify-between items-center text-sm">
              <span className="font-medium text-gray-700">Project Total:</span>
              <span className="font-semibold text-gray-900">
                {selectedProject.totalHours.toFixed(1)} hours
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Monthly Total */}
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
    </Card>
  );
}