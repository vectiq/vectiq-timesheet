import { useState } from 'react';
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
import { Clock, CheckCircle, AlertCircle, Undo2 } from 'lucide-react';
import { auth } from '@/lib/firebase';
import { format } from 'date-fns';
import type { ProjectWithStatus } from '@/types';

interface ApprovalDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  dateRange: {
    start: Date;
    end: Date;
  };
  projectsWithStatus: ProjectWithStatus[];
}

export function ApprovalDialog({
  open,
  onOpenChange,
  dateRange,
  projectsWithStatus,
}: ApprovalDialogProps) {
  const { projects } = useProjects();
  const { clients } = useClients();
  const { timeEntries } = useTimeEntries({ dateRange });
  const { submitApproval, isSubmitting } = useApprovals();
  const [selectedProject, setSelectedProject] = useState('');
  const [error, setError] = useState<string | null>(null);

  const selectedProjectData = projectsWithStatus.find(p => p.id === selectedProject);
  const canSubmit = selectedProject && (
    selectedProjectData?.status === 'unsubmitted' || 
    selectedProjectData?.status === 'withdrawn' ||
    selectedProjectData?.status === 'rejected'
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!selectedProject || !auth.currentUser) return;

    const project = projects.find(p => p.id === selectedProject);
    const client = clients.find(c => c.id === project?.clientId);
    
    if (!project || !client) return;

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
              {projectsWithStatus.map(project => (
                <option 
                  key={project.id} 
                  value={project.id}
                  disabled={project.status === 'pending' || project.status === 'approved'}
                >
                  {project.clientName} - {project.name} ({project.totalHours.toFixed(2)} hours)
                  {project.status !== 'unsubmitted' ? ` [${project.status}]` : ''}
                </option>
              ))}
            </select>
          </FormField>

          {selectedProjectData && selectedProjectData.status !== 'unsubmitted' && (
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">Status:</span>
              <Badge 
                variant={
                  selectedProjectData.status === 'approved' ? 'success' :
                  selectedProjectData.status === 'pending' ? 'warning' :
                  selectedProjectData.status === 'rejected' ? 'destructive' :
                  'secondary'
                }
                className="flex items-center gap-1.5"
              >
                {selectedProjectData.status === 'pending' && <Clock className="h-3 w-3" />}
                {selectedProjectData.status === 'approved' && <CheckCircle className="h-3 w-3" />}
                {selectedProjectData.status === 'rejected' && <AlertCircle className="h-3 w-3" />}
                {selectedProjectData.status === 'withdrawn' && <Undo2 className="h-3 w-3" />}
                {selectedProjectData.status.charAt(0).toUpperCase() + selectedProjectData.status.slice(1)}
              </Badge>
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
              {format(dateRange.start, 'MMM d, yyyy')} - {format(dateRange.end, 'MMM d, yyyy')}
            </p>
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