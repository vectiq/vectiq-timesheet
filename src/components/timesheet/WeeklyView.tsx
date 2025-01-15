import { useMemo, memo, useState } from 'react';
import { format } from 'date-fns';
import { Card } from '@/components/ui/Card';
import { Table, TableHeader, TableBody, Th } from '@/components/ui/Table';
import { Button } from '@/components/ui/Button';
import { Plus, Copy, Loader2 } from 'lucide-react';
import { TimesheetRow } from './TimesheetRow';
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogAction,
  AlertDialogCancel,
} from '@/components/ui/AlertDialog';
import { useTimeEntries } from '@/lib/hooks/useTimeEntries';
import { useClients } from '@/lib/hooks/useClients';
import { useTasks } from '@/lib/hooks/useTasks';
import { useCallback } from 'react';
import type { Project } from '@/types';

interface WeeklyViewProps {
  projects: Project[];
  userId?: string;
  dateRange: {
    start: Date;
    end: Date;
  };
}

export const WeeklyView = memo(function WeeklyView({ projects, userId, dateRange }: WeeklyViewProps) {
  const [deleteConfirmation, setDeleteConfirmation] = useState<{ isOpen: boolean; index: number | null }>({
    isOpen: false,
    index: null
  });
  const { 
    timeEntries,
    rows,
    isCopying,
    hasEntriesForCurrentWeek,
    copyFromPreviousWeek,
    editingCell,
    addRow,
    removeRow,
    updateRow,
    handleCellChange,
    setEditingCell
  } = useTimeEntries({ 
    userId,
    dateRange 
  });

  // Get projects and tasks where user is assigned
  const getProjectsForClient = useCallback((clientId: string) => 
    projects.filter(p => p.clientId === clientId),
    [projects]
  );

  const getTasksForProject = useCallback((projectId: string) => {
    const project = projects.find(p => p.id === projectId);
    if (!project) return [];
    return project.tasks.filter(task => 
      task.userAssignments?.some(a => a.userId === userId)
    );
  }, [projects, userId]);

  const weekDays = useMemo(() => {
    const days: Date[] = [];
    let currentDate = new Date(dateRange.start);
    while (currentDate <= dateRange.end) {
      days.push(new Date(currentDate));
      currentDate.setDate(currentDate.getDate() + 1);
    }
    return days;
  }, [dateRange]);

  const weekKey = format(dateRange.start, 'yyyy-MM-dd');

  // Calculate weekly total
  const weeklyTotal = useMemo(() => 
    timeEntries.reduce((total, entry) => total + entry.hours, 0),
    [timeEntries]
  );

  const handleDeleteRow = (index: number) => {
    setDeleteConfirmation({ isOpen: true, index });
  };

  const handleConfirmDelete = async () => {
    if (deleteConfirmation.index !== null) {
      await removeRow(deleteConfirmation.index);
    }
    setDeleteConfirmation({ isOpen: false, index: null });
  };

  return (
    <Card>
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <tr className="border-b border-gray-200">
              <Th className="w-[200px]">Client</Th>
              <Th className="w-[200px]">Project</Th>
              <Th className="w-[200px]">Task</Th>
              {weekDays.map(day => (
                <Th key={day.toISOString()} className="w-[100px] text-center">
                  <div>{format(day, 'EEE')}</div>
                  <div className="text-gray-500">{format(day, 'MMM d')}</div>
                </Th>
              ))}
              <Th className="w-[100px] text-center">Total</Th>
              <Th className="w-[50px]"></Th>
            </tr>
          </TableHeader>
          <TableBody>
            {rows.map((row, index) => (
              <TimesheetRow
                key={index}
                index={index}
                row={row}
                weekKey={weekKey}
                weekDays={weekDays}
                timeEntries={timeEntries}
                getProjectsForClient={getProjectsForClient}
                getTasksForProject={getTasksForProject}
                editingCell={editingCell}
                onUpdateRow={updateRow}
                onRemoveRow={handleDeleteRow}
                onCellChange={handleCellChange}
                onStartEdit={setEditingCell}
                onEndEdit={() => setEditingCell(null)}
                userId={userId}
              />
            ))}
          </TableBody>
        </Table>
      </div>

      <div className="p-4 border-t space-y-4">
        <div className="flex justify-between items-center">
          <div className="text-sm">
            {!hasEntriesForCurrentWeek && (
              <Button
                variant="secondary"
                disabled={isCopying}
                onClick={copyFromPreviousWeek}
                className="mr-4"
              >
                {isCopying ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Copying...
                  </>
                ) : (
                  <>
                    <Copy className="h-4 w-4 mr-2" />
                    Copy Previous Week
                  </>
                )}
              </Button>
            )}
            <span className="font-medium text-gray-700">Weekly Total:</span>
            <span className="ml-2 font-semibold text-gray-900">
              {weeklyTotal.toFixed(2)} hours
            </span>
          </div>
        </div>
        <Button
          variant="secondary"
          onClick={addRow}
          className="w-full"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Row
        </Button>
      </div>

      <AlertDialog 
        open={deleteConfirmation.isOpen} 
        onOpenChange={(open) => setDeleteConfirmation(prev => ({ ...prev, isOpen: open }))}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Row</AlertDialogTitle>
            <AlertDialogDescription>
              This will delete all time entries for this row. Are you sure you want to continue?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmDelete}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  );
});