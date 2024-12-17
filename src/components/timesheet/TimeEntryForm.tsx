import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { timeEntrySchema, type TimeEntryFormData } from '@/lib/schemas/timeEntry';
import { Button } from '@/components/ui/Button';
import { Project } from '@/types';
import { FormField } from './FormField';
import { ProjectSelect } from './ProjectSelect';

interface Props {
  onSubmit: (data: TimeEntryFormData) => void;
  onCancel: () => void;
  projects: Project[];
}

export function TimeEntryForm({ onSubmit, onCancel, projects }: Props) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<TimeEntryFormData>({
    resolver: zodResolver(timeEntrySchema),
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <ProjectSelect
        projects={projects}
        error={errors.projectId?.message}
        register={register}
      />

      <FormField label="Date" id="date" error={errors.date?.message}>
        <input
          type="date"
          id="date"
          {...register('date')}
          className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
        />
      </FormField>

      <FormField label="Hours" id="hours" error={errors.hours?.message}>
        <input
          type="number"
          id="hours"
          step="0.25"
          {...register('hours', { valueAsNumber: true })}
          className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
        />
      </FormField>

      <FormField label="Description" id="description" error={errors.description?.message}>
        <textarea
          id="description"
          {...register('description')}
          rows={3}
          className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
        />
      </FormField>

      <div className="flex justify-end space-x-3">
        <Button type="button" variant="secondary" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Submitting...' : 'Submit'}
        </Button>
      </div>
    </form>
  );
}