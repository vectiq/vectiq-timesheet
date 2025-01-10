import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/Dialog';
import { Button } from '@/components/ui/Button';
import { FormField } from '@/components/ui/FormField';
import { formatCurrency } from '@/lib/utils/currency';
import { projectAssignmentSchema } from '@/lib/schemas/user';
import { useProjects } from '@/lib/hooks/useProjects';
import { useTasks } from '@/lib/hooks/useTasks';
import { useClients } from '@/lib/hooks/useClients';
import type { ProjectAssignment, User } from '@/types';

interface ProjectAssignmentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: User;
  onSubmit: (data: Omit<ProjectAssignment, 'id'>) => void;
}

export function ProjectAssignmentDialog({
  open,
  onOpenChange,
  user,
  onSubmit,
}: ProjectAssignmentDialogProps) {
  const { projects } = useProjects();
  const { tasks } = useTasks();
  const { clients } = useClients();

  const {
    register,
    handleSubmit,
    watch,
    reset,
  } = useForm({
    defaultValues: {
      userId: user.id,
      clientId: '',
      projectId: '',
      taskId: ''
    },
  });

  const selectedClientId = watch('clientId');
  const filteredProjects = projects.filter(p => p.clientId === selectedClientId);
  const selectedProjectId = watch('projectId');
  const selectedProject = projects.find(p => p.id === selectedProjectId);
  const availableTasks = selectedProject?.tasks || [];

  useEffect(() => {
    if (open) {
      reset({
        userId: user.id,
        clientId: '',
        projectId: '',
        taskId: ''
      });
    }
  }, [open, user.id, reset]);

  const handleFormSubmit = async (data: any) => {
    await onSubmit(data);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            Assign {user.name} to Project
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
          <FormField label="Client">
            <select
              {...register('clientId')}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            >
              <option value="">Select Client</option>
              {clients.map(client => (
                <option key={client.id} value={client.id}>
                  {client.name}
                </option>
              ))}
            </select>
          </FormField>

          <FormField label="Project">
            <select
              {...register('projectId')}
              disabled={!selectedClientId}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            >
              <option value="">Select Project</option>
              {filteredProjects.map(project => (
                <option key={project.id} value={project.id}>
                  {project.name}
                </option>
              ))}
            </select>
          </FormField>

          <FormField label="Task">
            <select
              {...register('taskId')}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              disabled={!selectedProjectId}
            >
              <option value="">Select Task</option>
              {availableTasks.map(task => (
                <option key={task.id} value={task.id}>
                  {task.name} ({formatCurrency(task.sellRate)}/hr)
                </option>
              ))}
            </select>
          </FormField>

          <div className="flex justify-end gap-3">
            <Button
              type="button"
              variant="secondary"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit">
              Assign to Project
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}