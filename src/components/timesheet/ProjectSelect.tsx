import { Project } from '@/types';
import { FormField } from './FormField';
import { UseFormRegister } from 'react-hook-form';
import { TimeEntryFormData } from '@/lib/schemas/timeEntry';

interface ProjectSelectProps {
  projects: Project[];
  error?: string;
  register: UseFormRegister<TimeEntryFormData>;
}

export function ProjectSelect({ projects, error, register }: ProjectSelectProps) {
  return (
    <FormField label="Project" id="projectId" error={error}>
      <select
        id="projectId"
        {...register('projectId')}
        className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
      >
        <option value="">Select a project</option>
        {projects.map((project) => (
          <option key={project.id} value={project.id}>
            {project.name}
          </option>
        ))}
      </select>
    </FormField>
  );
}