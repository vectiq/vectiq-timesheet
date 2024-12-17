import { Save, Send, Copy } from 'lucide-react';
import { TimesheetActionButton } from './TimesheetActionButton';

interface TimesheetActionsProps {
  onSave: () => void;
  onSubmit: () => void;
  onCopyPrevious: () => void;
  isSubmitting: boolean;
}

export function TimesheetActions({
  onSave,
  onSubmit,
  onCopyPrevious,
  isSubmitting,
}: TimesheetActionsProps) {
  return (
    <div className="flex justify-between items-center">
      <TimesheetActionButton
        onClick={onCopyPrevious}
        icon={Copy}
        label="Copy Previous Week"
        variant="secondary"
        disabled={isSubmitting}
      />

      <div className="flex items-center gap-3">
        <TimesheetActionButton
          onClick={onSave}
          icon={Save}
          label={isSubmitting ? 'Saving...' : 'Save Draft'}
          variant="secondary"
          disabled={isSubmitting}
        />

        <TimesheetActionButton
          onClick={onSubmit}
          icon={Send}
          label={isSubmitting ? 'Submitting...' : 'Submit for Approval'}
          disabled={isSubmitting}
        />
      </div>
    </div>
  );
}