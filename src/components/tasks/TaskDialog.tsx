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
import { taskSchema } from '@/lib/schemas/task';
import type { Task } from '@/types';

interface TaskDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  task?: Task | null;
  onSubmit: (data: Task) => void;
}

export function TaskDialog({
  open,
  onOpenChange,
  task,
  onSubmit,
}: TaskDialogProps) {
  const {
    register,
    handleSubmit,
    reset,
  } = useForm({
    defaultValues: task || {
      name: '',
      isActive: true,
    },
  });

  useEffect(() => {
    if (open) {
      reset(task || {
        name: '',
        isActive: true,
      });
    }
  }, [open, task, reset]);

  const handleFormSubmit = async (data: any) => {
    await onSubmit({ ...data, id: task?.id });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {task ? 'Edit Task' : 'New Task'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
          <FormField label="Name">
            <input
              {...register('name')}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              placeholder="e.g., Senior Developer"
            />
          </FormField>

          <FormField label="Status">
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                {...register('isActive')}
                className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
              />
              <span className="text-sm text-gray-600">Active</span>
            </div>
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
              {task ? 'Update' : 'Create'} Task
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}