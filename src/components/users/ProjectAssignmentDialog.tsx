import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { SlidePanel } from '@/components/ui/SlidePanel';
import { Button } from '@/components/ui/Button';
import { FormField } from '@/components/ui/FormField';
import { formatCurrency } from '@/lib/utils/currency';
import { UserPlus } from 'lucide-react';
import { useProjects } from '@/lib/hooks/useProjects';
import { useRoles } from '@/lib/hooks/useRoles';
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
  const { roles } = useRoles();
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
      roleId: ''
    },
  });

  const selectedClientId = watch('clientId');
  const filteredProjects = projects.filter(p => p.clientId === selectedClientId);
  const selectedProjectId = watch('projectId');
  const selectedProject = projects.find(p => p.id === selectedProjectId);
  const availableRoles = selectedProject?.roles || [];

  useEffect(() => {
    if (open) {
      reset({
        userId: user.id,
        clientId: '',
        projectId: '',
        roleId: ''
      });
    }
  }, [open, user.id, reset]);

  const handleFormSubmit = async (data: any) => {
    await onSubmit(data);
    onOpenChange(false);
  };

  return (
    <SlidePanel
      open={open}
      onClose={() => onOpenChange(false)}
      title={`Assign ${user.name} to Project`}
      icon={<UserPlus className="h-5 w-5 text-indigo-500" />}
    >
      <div className="p-6">
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

          <FormField label="Role">
            <select
              {...register('roleId')}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              disabled={!selectedProjectId}
            >
              <option value="">Select Role</option>
              {availableRoles.map(role => (
                <option key={role.id} value={role.id}>
                  {role.name} ({formatCurrency(role.sellRate)}/hr)
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
      </div>
    </SlidePanel>
  );
}