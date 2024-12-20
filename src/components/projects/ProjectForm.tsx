import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/Button';
import { FormField } from '@/components/ui/FormField';
import { projectSchema } from '@/lib/schemas/project';
import { useClients } from '@/lib/hooks/useClients';
import { ProjectRolesTable } from './ProjectRolesTable';
import type { Project, ProjectRole } from '@/types';

interface ProjectFormProps {
  project?: Project | null;
  onSubmit: (data: Project) => void;
  onCancel: () => void;
}

export function ProjectForm({ project, onSubmit, onCancel }: ProjectFormProps) {
  const { clients } = useClients();

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
    reset,
  } = useForm({
    resolver: zodResolver(projectSchema),
    defaultValues: project || {
      name: '',
      clientId: '',
      budget: 0,
      startDate: '',
      endDate: '',
      requiresApproval: false,
      roles: [],
    },
  });

  // Reset form when project changes
  useEffect(() => {
    if (project) {
      reset(project);
    }
  }, [project, reset]);

  const roles = watch('roles') || [];

  const handleFormSubmit = async (data: any) => {
    // Ensure we have the project ID if we're updating
    const projectData: Project = {
      ...data,
      id: project?.id || `proj_${Date.now()}`,
      roles: roles,
    };
    
    await onSubmit(projectData);
  };

  const handleRateChange = (roleId: string, rates: { costRate: number; sellRate: number }) => {
    const currentRoles = roles.filter(r => r.roleId !== roleId);
    setValue('roles', [...currentRoles, { roleId, ...rates }]);
  };

  const handleAddRole = (roleId: string) => {
    setValue('roles', [...roles, { roleId, costRate: 0, sellRate: 0 }]);
  };

  const handleRemoveRole = (roleId: string) => {
    setValue('roles', roles.filter(r => r.roleId !== roleId));
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-8">
      <div className="space-y-4">
        <FormField label="Project Name" error={errors.name?.message}>
          <input
            {...register('name')}
            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            placeholder="e.g., Website Redesign"
          />
        </FormField>

        <FormField label="Client" error={errors.clientId?.message}>
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

        <div className="grid grid-cols-3 gap-4">
          <FormField label="Budget" error={errors.budget?.message}>
            <input
              type="number"
              step="0.01"
              {...register('budget', { valueAsNumber: true })}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            />
          </FormField>

          <FormField label="Start Date" error={errors.startDate?.message}>
            <input
              type="date"
              {...register('startDate')}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            />
          </FormField>

          <FormField label="End Date" error={errors.endDate?.message}>
            <input
              type="date"
              {...register('endDate')}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            />
          </FormField>
        </div>

        <FormField label="Approval Required" error={errors.requiresApproval?.message}>
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              {...register('requiresApproval')}
              className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
            />
            <span className="text-sm text-gray-600">Require time entry approval</span>
          </div>
        </FormField>

        <div className="space-y-2">
          <h3 className="text-sm font-medium text-gray-700">Project Roles</h3>
          <ProjectRolesTable
            selectedRoleIds={roles.map(r => r.roleId)}
            rates={roles.reduce((acc, role) => ({ ...acc, [role.roleId]: role }), {})}
            onRateChange={handleRateChange}
            onAddRole={handleAddRole}
            onRemoveRole={handleRemoveRole}
          />
        </div>
      </div>

      <div className="flex justify-end gap-3 pt-4 border-t">
        <Button type="button" variant="secondary" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit">
          {project ? 'Update' : 'Create'} Project
        </Button>
      </div>
    </form>
  );
}