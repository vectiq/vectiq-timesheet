import { useState, useMemo } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/Dialog';
import { Button } from '@/components/ui/Button';
import { FormField } from '@/components/ui/FormField';
import { useProjects } from '@/lib/hooks/useProjects';
import { useClients } from '@/lib/hooks/useClients';
import { useTimeEntries } from '@/lib/hooks/useTimeEntries';
import { useApprovals } from '@/lib/hooks/useApprovals';
import { Badge } from '@/components/ui/Badge';
import type { BadgeVariant } from '@/components/ui/Badge';
import { auth } from '@/lib/firebase';
import { format, isWithinInterval } from 'date-fns';

interface ProjectWithStatus {
  id: string;
  name: string;
  clientName: string;
  totalHours: number;
  status?: 'unsubmitted' | 'pending' | 'approved' | 'rejected' | 'withdrawn';
}

interface ApprovalDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  dateRange: {
    start: Date;
    end: Date;
  };
}

export function ApprovalDialog({
  open,
  onOpenChange,
  dateRange,
}: ApprovalDialogProps) {
  const { projects } = useProjects();
  const { clients } = useClients();
  const { timeEntries } = useTimeEntries({ dateRange });
  const { approvals, submitApproval, isSubmitting } = useApprovals();
  const [selectedProject, setSelectedProject] = useState('');
  const [error, setError] = useState<string | null>(null);
  const userId = auth.currentUser?.uid;
  const startDate = format(dateRange.start, 'yyyy-MM-dd');
  const endDate = format(dateRange.end, 'yyyy-MM-dd');

  function getStatusBadge(status?: 'unsubmitted' | 'pending' | 'approved' | 'rejected' | 'withdrawn') {
    let variant: BadgeVariant = 'secondary';
    let text = 'Unsubmitted';

    switch (status) {
      case 'pending':
        variant = 'warning';
        text = 'Pending Approval';
        break;
      case 'approved':
        variant = 'success';
        text = 'Approved';
        break;
      case 'rejected':
        variant = 'destructive';
        text = 'Rejected';
        break;
      case 'withdrawn':
        variant = 'secondary';
        text = 'Withdrawn';
        break;
    }

    return <Badge variant={variant}>{text}</Badge>;
  }

  // Get projects with time entries for the current period
  const projectsWithEntries = useMemo(() => {
    // Get unique project IDs from time entries
    const projectIds = new Set(timeEntries.map(entry => entry.projectId));
    
    // Generate composite key for current period
    const generateCompositeKey = (projectId: string) => 
      `${projectId}_${startDate}_${endDate}_${userId}`;

    // Get all approvals for the current period
    const periodApprovals = approvals.filter(approval => 
      approval.period.startDate === startDate && 
      approval.period.endDate === endDate &&
      approval.userId === userId
    );

    // Filter projects that have entries and require approval
    return projects
      .filter(project => 
        projectIds.has(project.id) && 
        project.requiresApproval
      )
      .map(project => {
        const client = clients.find(c => c.id === project.clientId);
        const projectEntries = timeEntries
          .filter(entry => entry.projectId === project.id)
          .reduce((sum, entry) => sum + entry.hours, 0);

        // Find any existing approval for this project in the period
        const approval = periodApprovals.find(a => a.compositeKey === generateCompositeKey(project.id) &&
          a.project.id === project.id && 
          a.userId === auth.currentUser?.uid
        );

        return {
          id: project.id,
          name: project.name,
          clientName: client?.name || 'Unknown Client',
          totalHours: projectEntries,
          status: approval?.status || 'unsubmitted'
        };
      });
  }, [timeEntries, projects, clients, approvals, dateRange, auth.currentUser?.uid]);

  const selectedProjectStatus = projectsWithEntries.find(p => p.id === selectedProject)?.status;
  const canSubmit = selectedProject && (
    selectedProjectStatus === 'unsubmitted' || 
    selectedProjectStatus === 'withdrawn'
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const project = projects.find(p => p.id === selectedProject);
    const client = clients.find(c => c.id === project?.clientId);
    
    if (!project || !client || !auth.currentUser) return;

    // Filter entries for selected project
    const projectEntries = timeEntries.filter(entry => 
      entry.projectId === project.id
    );

    try {
      await submitApproval({
        project,
        client,
        dateRange,
        entries: projectEntries,
        userId: auth.currentUser.uid,
      });
      onOpenChange(false);
    } catch (error) {
      setError('Failed to submit timesheet for approval');
      console.error(error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Submit Time for Approval</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <FormField label="Project">
            <select
              value={selectedProject}
              onChange={(e) => setSelectedProject(e.target.value)}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              required
            >
              <option value="">Select Project</option>
              {projectsWithEntries.map(project => (
                <option 
                  key={project.id} 
                  value={project.id}
                  disabled={project.status !== 'unsubmitted' && project.status !== 'withdrawn'}
                >
                  {project.clientName} - {project.name} ({project.totalHours.toFixed(2)} hours) {project.status !== 'unsubmitted' ? `[${project.status.charAt(0).toUpperCase() + project.status.slice(1)}]` : ''}
                </option>
              ))}
            </select>
          </FormField>
          
          {selectedProject && selectedProjectStatus && selectedProjectStatus !== 'unsubmitted' && (
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">Status:</span>
              {getStatusBadge(selectedProjectStatus)}
            </div>
          )}
          
          {projectsWithEntries.length === 0 && (
            <div className="text-sm text-gray-500">
              No projects with time entries for this period require approval.
            </div>
          )}
          
          {error && (
            <div className="text-sm text-red-600">
              {error}
            </div>
          )}

          <div className="pt-4 border-t space-y-2 text-sm text-gray-600">
            <p>This will submit your timesheet for the period:</p>
            <p className="font-medium">
              {format(dateRange.start, 'MMMM d, yyyy')} - {format(dateRange.end, 'MMMM d, yyyy')}
            </p>
            {selectedProjectStatus === 'withdrawn' && (
              <p className="text-yellow-600">
                Note: This timesheet was previously withdrawn. Submitting again will create a new approval request.
              </p>
            )}
          </div>

          <div className="flex justify-end gap-3">
            <Button
              type="button"
              variant="secondary"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={!canSubmit || isSubmitting}>
              {isSubmitting ? 'Submitting...' : 'Submit for Approval'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}