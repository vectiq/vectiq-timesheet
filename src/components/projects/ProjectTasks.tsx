import { useFieldArray, Control } from 'react-hook-form';
import { Plus, X } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { FormField } from '@/components/ui/FormField';
import type { Project } from '@/types';

interface ProjectTasksProps {
  control: Control<Project>;
}

export function ProjectTasks({ control }: ProjectTasksProps) {
  const { fields, append, remove } = useFieldArray({
    control,
    name: 'tasks',
  });

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-sm font-medium text-gray-700">Project Tasks</h3>
        <Button
          type="button"
          variant="secondary"
          size="sm"
          onClick={() => append({ id: crypto.randomUUID(), name: '', costRate: 0, sellRate: 0 })}
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Task
        </Button>
      </div>

      <div className="space-y-4">
        {fields.map((field, index) => (
          <div key={field.id} className="flex gap-4 items-start">
            <div className="flex-1 grid grid-cols-3 gap-4">
              <FormField label="Task Name">
                <input
                  {...control.register(`tasks.${index}.name`)}
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                />
              </FormField>

              <FormField label="Cost Rate">
                <input
                  type="number"
                  {...control.register(`tasks.${index}.costRate`, { valueAsNumber: true })}
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                />
              </FormField>

              <FormField label="Sell Rate">
                <input
                  type="number"
                  {...control.register(`tasks.${index}.sellRate`, { valueAsNumber: true })}
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                />
              </FormField>
            </div>

            <Button
              type="button"
              variant="secondary"
              size="sm"
              className="mt-8"
              onClick={() => remove(index)}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
}