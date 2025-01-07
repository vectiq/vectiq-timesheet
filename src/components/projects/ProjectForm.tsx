import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/Button';
import { FormField } from '@/components/ui/FormField';
import { Plus, X } from 'lucide-react';
import { useClients } from '@/lib/hooks/useClients';
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
    watch,
    setValue,
    reset,
  } = useForm({
    defaultValues: project || {
      name: '',
      clientId: '',
      approverEmail: '',
      budget: 0,
      startDate: '',
      endDate: '',
      requiresApproval: false,
      overtimeInclusive: true,
      roles: [],
    },
  });

  useEffect(() => {
    if (project) {
      reset(project);
    }
  }, [project, reset]);

  const roles = watch('roles') || [];

  const handleFormSubmit = async (data: any) => {
    const projectId = project?.id || crypto.randomUUID();
    const projectData: Project = {
      id: projectId,
      name: data.name || '',
      clientId: data.clientId || '',
      budget: data.budget || 0,
      startDate: data.startDate || '',
      endDate: data.endDate || '',
      approverEmail: data.approverEmail || '',
      requiresApproval: data.requiresApproval || false,
      overtimeInclusive: data.overtimeInclusive || false,
      roles: data.roles || []
    };
    
    try {
      await onSubmit(projectData);
    } catch (error) {
      console.error('Error submitting project:', error);
      throw error;
    }
  };

  const addRole = () => {
    const newRole: ProjectRole = {
      id: crypto.randomUUID(),
      name: '',
      projectId: project?.id || '',
      costRate: 0,
      sellRate: 0,
      billable: false
    };
    setValue('roles', [...roles, newRole]);
  };

  const removeRole = (index: number) => {
    const newRoles = [...roles];
    newRoles.splice(index, 1);
    setValue('roles', newRoles);
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
      <div className="space-y-3">
        <div className="grid grid-cols-2 gap-4">
          <FormField label="Project Name">
          <input
            {...register('name')}
            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            placeholder="e.g., Website Redesign"
          />
          </FormField>

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
        </div>

        <div className="grid grid-cols-3 gap-4">
          <FormField label="Budget">
            <input
              type="number"
              step="0.01"
              {...register('budget', { valueAsNumber: true })}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            />
          </FormField>

          <FormField label="Start Date">
            <input
              type="date"
              {...register('startDate')}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            />
          </FormField>

          <FormField label="End Date">
            <input
              type="date"
              {...register('endDate')}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            />
          </FormField>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <FormField label="Approver Email">
            <input
              type="email"
              {...register('approverEmail')}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              placeholder="e.g., approver@company.com"
            />
          </FormField>

          <div className="flex gap-6 items-center mt-8">
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                {...register('requiresApproval')}
                className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
              />
              <span className="text-sm text-gray-600">Require approval</span>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                {...register('overtimeInclusive')}
                className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
              />
              <span className="text-sm text-gray-600">Include overtime</span>
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <h3 className="text-sm font-medium text-gray-700">Project Roles</h3>
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={addRole}
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Role
            </Button>
          </div>
          
          <div className="space-y-2 mt-2">
            {roles.map((role, index) => (
              <div key={role.id} className="flex gap-2 items-start bg-gray-50 p-2 rounded-lg">
                <div className="flex-1 grid grid-cols-4 gap-4">
                  <FormField label="Role Name">
                    <input
                      {...register(`roles.${index}.name`)}
                      className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                      placeholder="e.g., Senior Developer"
                    />
                  </FormField>

                  <FormField label="Cost Rate">
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      {...register(`roles.${index}.costRate`, { valueAsNumber: true })}
                      className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                    />
                  </FormField>

                  <FormField label="Sell Rate">
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      {...register(`roles.${index}.sellRate`, { valueAsNumber: true })}
                      className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                    />
                  </FormField>

                  <FormField label="Billable">
                    <div className="flex items-center h-10">
                      <input
                        type="checkbox"
                        {...register(`roles.${index}.billable`)}
                        className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                      />
                    </div>
                  </FormField>
                </div>

                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={() => removeRole(index)} 
                  className="mt-7">
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
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