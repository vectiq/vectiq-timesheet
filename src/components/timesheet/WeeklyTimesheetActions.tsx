import { Button } from '@/components/ui/Button';
import { Save, Send, Copy } from 'lucide-react';

interface WeeklyTimesheetActionsProps {
  onSave: () => void;
  onSubmit: () => void;
  onCopyPrevious: () => void;
  isSubmitting: boolean;
}

export function WeeklyTimesheetActions({
  onSave,
  onSubmit,
  onCopyPrevious,
  isSubmitting,
}: WeeklyTimesheetActionsProps) {
  return (
    <div className="flex justify-between items-center">
      <Button
        variant="secondary"
        onClick={onCopyPrevious}
        disabled={isSubmitting}
        className="flex items-center gap-2"
      >
        <Copy className="h-4 w-4" />
        Copy Previous Week
      </Button>

      <div className="flex items-center gap-3">
        <Button
          variant="secondary"
          onClick={onSave}
          disabled={isSubmitting}
          className="flex items-center gap-2"
        >
          <Save className="h-4 w-4" />
          {isSubmitting ? 'Saving...' : 'Save Draft'}
        </Button>

        <Button
          onClick={onSubmit}
          disabled={isSubmitting}
          className="flex items-center gap-2"
        >
          <Send className="h-4 w-4" />
          {isSubmitting ? 'Submitting...' : 'Submit for Approval'}
        </Button>
      </div>
    </div>
  );
}