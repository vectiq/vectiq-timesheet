import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { WeeklyTimesheetTotal } from './WeeklyTimesheetTotal';
import { WeeklyTimesheetActions } from './WeeklyTimesheetActions';
import { useWeeklyTimesheetContext } from './WeeklyTimesheetContext';

export function WeeklyTimesheetFooter() {
  const { rows, setRows } = useWeeklyTimesheetContext();

  const handleAddRow = () => {
    setRows([...rows, { projectId: '', roleId: '', hours: {} }]);
  };

  return (
    <div className="p-4 border-t border-gray-200 space-y-4">
      <WeeklyTimesheetTotal />
      <WeeklyTimesheetActions />
      
      <Button
        type="button"
        variant="secondary"
        onClick={handleAddRow}
        className="w-full"
      >
        <Plus className="w-4 h-4 mr-2" />
        Add Project Row
      </Button>
    </div>
  );
}