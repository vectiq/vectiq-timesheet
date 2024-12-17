import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/Dialog';
import { Button } from '@/components/ui/Button';
import { FormField } from '@/components/ui/FormField';
import { inviteMemberSchema } from '@/lib/schemas/member';
import type { InviteMemberData } from '@/lib/schemas/member';

interface InviteMemberDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onInvite: (data: InviteMemberData) => void;
}

export function InviteMemberDialog({
  open,
  onOpenChange,
  onInvite,
}: InviteMemberDialogProps) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<InviteMemberData>({
    resolver: zodResolver(inviteMemberSchema),
  });

  const onSubmit = async (data: InviteMemberData) => {
    await onInvite(data);
    reset();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Invite Team Member</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <FormField label="Email" error={errors.email?.message}>
            <input
              type="email"
              {...register('email')}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              placeholder="colleague@example.com"
            />
          </FormField>

          <FormField label="Role" error={errors.role?.message}>
            <select
              {...register('role')}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            >
              <option value="">Select a role</option>
              <option value="consultant">Consultant</option>
              <option value="admin">Admin</option>
            </select>
          </FormField>

          <div className="flex justify-end gap-3">
            <Button
              type="button"
              variant="secondary"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Sending...' : 'Send Invitation'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}