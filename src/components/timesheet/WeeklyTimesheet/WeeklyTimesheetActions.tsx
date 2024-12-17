import { Button } from '@/components/ui/Button';
import { Save, Send, Copy } from 'lucide-react';
import { useWeeklyTimesheetContext } from './WeeklyTimesheetContext';

export function WeeklyTimesheetActions() {
  const {
    copyPreviousWeek,
    saveTimesheet,
    submitTimesheet,
    isCreating,
  } = useWeeklyTimesheetContext();

  return (
    <div className="flex justify-between items-center">
      <Button
        variant="secondary"
        onClick={copyPreviousWeek}
        className="flex items-center gap-2"
      >
        <Copy className="h-4 w-4" />
        Copy Previous Week
      </Button>

      <div className="flex items-center gap-3">
        <Button
          variant="secondary"
          onClick={saveTimesheet}
          disabled={isCreating}
          className="flex items-center gap-2"
        >
          <Save className="h-4 w-4" />
          {isCreating ? 'Saving...' : 'Save Draft'}
        </Button>

        <Button
          onClick={submitTimesheet}
          disabled={isCreating}
          className="flex items-center gap-2"
        >
          <Send className="h-4 w-4" />
          {isCreating ? 'Submitting...' : 'Submit for Approval'}
        </Button>
      </div>
    </div>
  );
}