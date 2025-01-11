import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Checkbox } from '@/components/ui/Checkbox';
import { FormField } from '@/components/ui/FormField';
import { useClients } from '@/lib/hooks/useClients';
import type { Project, ProjectTask } from '@/types';

interface ProjectFormProps {
  project?: Project | null;
  onSubmit: (data: Project) => void;
  onCancel: () => void;
}

export function ProjectForm({ project, onSubmit, onCancel }: ProjectFormProps) {
  const { clients } = useClients();

  // Initialize form with project data or defaults
  const {
    register,
    handleSubmit,
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
      xetaskaveTypeId: '',
    },
    shouldUnregister: false, // Prevent fields from being unregistered when removed
  });

  useEffect(() => {
    if (project) {
      reset(project);
    }
  }, [project, reset]);

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
      tasks: project?.tasks || [],
      xetaskaveTypeId: data.xetaskaveTypeId || '',
    };
    
    try {
      await onSubmit(projectData);
    } catch (error) {
      console.error('Error submitting project:', error);
      throw error;
    }
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
      <div className="space-y-3">
        <div className="grid grid-cols-2 gap-4">
          <FormField label="Project Name">
          <Input
            {...register('name')}
            placeholder="e.g., Website Redesign"
          />
          </FormField>

          <FormField label="Client">
          <Select
            {...register('clientId')}
          >
            <option value="">Select Client</option>
            {clients.map(client => (
              <option key={client.id} value={client.id}>
                {client.name}
              </option>
            ))}
          </Select>
          </FormField>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <FormField label="Budget">
            <Input
              type="number"
              step="0.01"
              {...register('budget', { valueAsNumber: true })}
            />
          </FormField>

          <FormField label="Start Date">
            <Input
              type="date"
              {...register('startDate')}
            />
          </FormField>

          <FormField label="End Date">
            <Input
              type="date"
              {...register('endDate')}
            />
          </FormField>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <FormField label="Approver Email">
            <Input
              type="email"
              {...register('approverEmail')}
              placeholder="e.g., approver@company.com"
            />
          </FormField>

          <div className="flex gap-6 items-center mt-8">
            <Checkbox
              {...register('requiresApproval')}
              label="Require approval"
            />
            <Checkbox
              {...register('overtimeInclusive')}
              label="Include overtime"
            />
          </div>
        </div>

        <FormField label="Xero Leave Type ID">
          <Input
            {...register('xetaskaveTypeId')}
            placeholder="e.g., 123e4567-e89b-12d3-a456-426614174000"
          />
          <p className="mt-1 text-xs text-gray-500">
            The Xero Leave Type ID is used to sync leave requests with Xero
          </p>
        </FormField>
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