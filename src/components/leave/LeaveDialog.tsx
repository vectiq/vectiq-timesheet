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

interface LeaveDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  leave?: any;
  onSubmit: (data: any) => void;
}

export function LeaveDialog({
  open,
  onOpenChange,
  leave,
  onSubmit,
}: LeaveDialogProps) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    defaultValues: leave || {
      startDate: '',
      endDate: '',
      leaveTypeId: '',
      description: '',
    },
  });

  useEffect(() => {
    if (open) {
      reset(leave || {
        startDate: '',
        endDate: '',
        leaveTypeId: '',
        description: '',
      });
    }
  }, [open, leave, reset]);

  const handleFormSubmit = async (data: any) => {
    await onSubmit(data);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {leave ? 'Edit Leave Request' : 'New Leave Request'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
          <FormField label="Start Date">
            <input
              type="date"
              {...register('startDate', { required: 'Start date is required' })}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            />
            {errors.startDate && (
              <p className="mt-1 text-sm text-red-600">{errors.startDate.message}</p>
            )}
          </FormField>

          <FormField label="End Date">
            <input
              type="date"
              {...register('endDate', { required: 'End date is required' })}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            />
            {errors.endDate && (
              <p className="mt-1 text-sm text-red-600">{errors.endDate.message}</p>
            )}
          </FormField>

          <FormField label="Leave Type">
            <select
              {...register('leaveTypeId', { required: 'Leave type is required' })}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            >
              <option value="">Select Leave Type</option>
              <option value="ANNUAL">Annual Leave</option>
              <option value="SICK">Sick Leave</option>
              <option value="PERSONAL">Personal Leave</option>
            </select>
            {errors.leaveTypeId && (
              <p className="mt-1 text-sm text-red-600">{errors.leaveTypeId.message}</p>
            )}
          </FormField>

          <FormField label="Description">
            <textarea
              {...register('description')}
              rows={3}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              placeholder="Optional description..."
            />
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
              {leave ? 'Update' : 'Submit'} Leave Request
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}