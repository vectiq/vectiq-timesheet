import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/Dialog';
import { Button } from '@/components/ui/Button';
import { projectSchema } from '@/lib/schemas/project';
import { FormField } from '@/components/ui/FormField';
import { ProjectRoles } from './ProjectRoles';
import type { Project } from '@/types';

interface ProjectDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  project?: Project | null;
  onSubmit: (data: Project) => void;
}

export function ProjectDialog({
  open,
  onOpenChange,
  project,
  onSubmit,
}: ProjectDialogProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
    control,
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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            {project ? 'Edit Project' : 'New Project'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <FormField
            label="Project Name"
            error={errors.name?.message}
          >
            <input
              {...register('name')}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            />
          </FormField>

          <div className="grid grid-cols-2 gap-4">
            <FormField
              label="Budget"
              error={errors.budget?.message}
            >
              <input
                type="number"
                {...register('budget', { valueAsNumber: true })}
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              />
            </FormField>

            <FormField
              label="Requires Approval"
              error={errors.requiresApproval?.message}
            >
              <input
                type="checkbox"
                {...register('requiresApproval')}
                className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
              />
            </FormField>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <FormField
              label="Start Date"
              error={errors.startDate?.message}
            >
              <input
                type="date"
                {...register('startDate')}
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              />
            </FormField>

            <FormField
              label="End Date"
              error={errors.endDate?.message}
            >
              <input
                type="date"
                {...register('endDate')}
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              />
            </FormField>
          </div>

          <ProjectRoles control={control} />

          <div className="flex justify-end gap-3">
            <Button
              type="button"
              variant="secondary"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit">
              {project ? 'Update' : 'Create'} Project
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}