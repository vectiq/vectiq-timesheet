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
import { format } from 'date-fns';

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
  const [selectedProject, setSelectedProject] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Get projects with time entries for the current period
  const projectsWithEntries = useMemo(() => {
    // Get unique project IDs from time entries
    const projectIds = new Set(timeEntries.map(entry => entry.projectId));
    
    // Filter projects that have entries and require approval
    return projects
      .filter(project => 
        projectIds.has(project.id) && 
        project.requiresApproval
      )
      .map(project => ({
        ...project,
        totalHours: timeEntries
          .filter(entry => entry.projectId === project.id)
          .reduce((sum, entry) => sum + entry.hours, 0)
      }));
  }, [timeEntries, projects]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const project = projects.find(p => p.id === selectedProject);
    const client = clients.find(c => c.id === project?.clientId);
    
    if (!project || !client) return;

    // Filter entries for selected project
    const projectEntries = timeEntries.filter(entry => 
      entry.projectId === project.id
    );

    // Calculate total hours
    const totalHours = projectEntries.reduce((sum, entry) => sum + entry.hours, 0);

    // Format date range
    const startDate = format(dateRange.start, 'MMM d, yyyy');
    const endDate = format(dateRange.end, 'MMM d, yyyy');

    // In a real app, you would send this via an API
    // For now, we'll just log it
    console.log('Sending approval request:', {
      project,
      client,
      dateRange: { startDate, endDate },
      totalHours,
      entries: projectEntries,
      to: project.approverEmail,
    });

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    setIsSubmitting(false);
    onOpenChange(false);
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
              {projectsWithEntries.map(project => {
                  const client = clients.find(c => c.id === project.clientId);
                  return (
                    <option key={project.id} value={project.id}>
                      {client?.name} - {project.name} ({project.totalHours.toFixed(2)} hours)
                    </option>
                  );
                })}
            </select>
          </FormField>
          
          {projectsWithEntries.length === 0 && (
            <div className="text-sm text-gray-500">
              No projects with time entries for this period require approval.
            </div>
          )}

          <div className="pt-4 border-t space-y-2 text-sm text-gray-600">
            <p>This will submit your timesheet for the period:</p>
            <p className="font-medium">
              {format(dateRange.start, 'MMMM d, yyyy')} - {format(dateRange.end, 'MMMM d, yyyy')}
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
            <Button type="submit" disabled={!selectedProject || isSubmitting}>
              {isSubmitting ? 'Submitting...' : 'Submit for Approval'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}