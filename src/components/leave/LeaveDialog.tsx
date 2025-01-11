import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { SlidePanel } from '@/components/ui/SlidePanel';
import { Button } from '@/components/ui/Button';
import { FormField } from '@/components/ui/FormField';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { CalendarDays } from 'lucide-react';
import type { Leave } from '@/types';

interface LeaveDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  leave?: Leave | null;
  onSubmit: (data: Omit<Leave, 'id' | 'status' | 'employeeId' | 'numberOfUnits' | 'updatedAt'>) => void;
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
    setValue,
    reset,
    formState: { errors },
  } = useForm({
    defaultValues: leave || {
      title: '',
      startDate: '',
      endDate: '',
      leaveTypeId: '',
      description: '',
    },
  });

  useEffect(() => {
    if (open) {
      const defaultValues = {
        title: '',
        startDate: '',
        endDate: '',
        leaveTypeId: '',
        description: '',
      };

      if (leave) {
        // Format dates to YYYY-MM-DD for input[type="date"]
        const formattedStartDate = leave.startDate.split('T')[0];
        const formattedEndDate = leave.endDate.split('T')[0];
        
        reset({
          ...leave,
          startDate: formattedStartDate,
          endDate: formattedEndDate
        });
      } else {
        reset(defaultValues);
      }
    }
  }, [open, leave, reset]);

  const handleFormSubmit = async (data: any) => {
    await onSubmit(data);
    onOpenChange(false);
  };

  return (
    <SlidePanel
      open={open}
      onClose={() => onOpenChange(false)}
      title={leave ? 'Edit Leave Request' : 'New Leave Request'}
      icon={<CalendarDays className="h-5 w-5 text-indigo-500" />}
    >
      <div className="p-6">
        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
          <FormField label="Title">
            <Input
              {...register('title', { required: 'Title is required' })}
              placeholder="e.g., Annual Leave"
              error={!!errors.title}
            />
            {errors.title && (
              <p className="mt-1 text-sm text-red-600">{errors.title.message}</p>
            )}
          </FormField>

          <FormField label="Start Date">
            <Input
              type="date"
              {...register('startDate', { required: 'Start date is required' })}
              error={!!errors.startDate}
            />
            {errors.startDate && (
              <p className="mt-1 text-sm text-red-600">{errors.startDate.message}</p>
            )}
          </FormField>

          <FormField label="End Date">
            <Input
              type="date"
              {...register('endDate', { required: 'End date is required' })}
              error={!!errors.endDate}
            />
            {errors.endDate && (
              <p className="mt-1 text-sm text-red-600">{errors.endDate.message}</p>
            )}
          </FormField>

          <FormField label="Leave Type">
            <Select
              {...register('leaveTypeId', { required: 'Leave type is required' })}
              error={!!errors.leaveTypeId}
            >
              <option value="">Select Leave Type</option>
              <option value="ANNUAL">Annual Leave</option>
              <option value="SICK">Sick Leave</option>
              <option value="PERSONAL">Personal Leave</option>
            </Select>
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
      </div>
    </SlidePanel>
  );
}