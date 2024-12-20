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
import { roleSchema } from '@/lib/schemas/role';
import type { Role } from '@/types';

interface RoleDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  role?: Role | null;
  onSubmit: (data: Role) => void;
}

export function RoleDialog({
  open,
  onOpenChange,
  role,
  onSubmit,
}: RoleDialogProps) {
  const {
    register,
    handleSubmit,
    reset,
  } = useForm({
    defaultValues: role || {
      name: '',
      isActive: true,
    },
  });

  useEffect(() => {
    if (open) {
      reset(role || {
        name: '',
        isActive: true,
      });
    }
  }, [open, role, reset]);

  const handleFormSubmit = async (data: any) => {
    await onSubmit({ ...data, id: role?.id });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {role ? 'Edit Role' : 'New Role'}
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
              {role ? 'Update' : 'Create'} Role
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}