import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/Dialog';
import { TimeEntryForm } from './TimeEntryForm';
import type { Project } from '@/types';
import type { TimeEntryFormData } from '@/lib/schemas/timeEntry';

interface TimeEntryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: TimeEntryFormData) => void;
  projects: Project[];
}

export function TimeEntryDialog({
  open,
  onOpenChange,
  onSubmit,
  projects,
}: TimeEntryDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>New Time Entry</DialogTitle>
        </DialogHeader>
        <TimeEntryForm
          projects={projects}
          onSubmit={onSubmit}
          onCancel={() => onOpenChange(false)}
        />
      </DialogContent>
    </Dialog>
  );
}