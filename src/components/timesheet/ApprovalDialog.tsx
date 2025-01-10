import { useState } from 'react';
import { SlidePanel } from '@/components/ui/SlidePanel';
import { Button } from '@/components/ui/Button';
import { FormField } from '@/components/ui/FormField';
import { useProjects } from '@/lib/hooks/useProjects';
import { useClients } from '@/lib/hooks/useClients';
import { useTimeEntries } from '@/lib/hooks/useTimeEntries';
import { useUsers } from '@/lib/hooks/useUsers';
import { useApprovals } from '@/lib/hooks/useApprovals';
import { format } from 'date-fns';
import { FileCheck } from 'lucide-react';
import type { ProjectWithStatus } from '@/types';

interface ApprovalDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userId?: string;
  dateRange: {
    start: Date;
    end: Date;
  };
  projectsWithStatus: ProjectWithStatus[];
}

export function ApprovalDialog({
  open,
  onOpenChange,
  userId,
  dateRange,
  projectsWithStatus,
}: ApprovalDialogProps) {
  const { projects } = useProjects();
  const { clients } = useClients();
  const { timeEntries } = useTimeEntries({ dateRange, userId });
  const { effectiveUser } = useUsers();
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

    if (!selectedProject || !effectiveUser) return;

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
        userId: effectiveUser.id,
      });
      onOpenChange(false);
    } catch (error) {
      setError('Failed to submit timesheet for approval');
      console.error(error);
    }
  };

  return (
    <SlidePanel
      open={open}
      onClose={() => onOpenChange(false)}
      title="Submit Time for Approval"
      subtitle={`${format(dateRange.start, 'MMM d, yyyy')} - ${format(dateRange.end, 'MMM d, yyyy')}`}
      icon={<FileCheck className="h-5 w-5 text-indigo-500" />}
    >
      <div className="p-6">
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
                  {project.status !== 'unsubmitted' && project.status !== 'withdrawn' ? ` [${project.status}]` : ''}
                </option>
              ))}
            </select>
          </FormField>

          {error && (
            <div className="text-sm text-red-600">
              {error}
            </div>
          )}

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
      </div>
    </SlidePanel>
  );
}