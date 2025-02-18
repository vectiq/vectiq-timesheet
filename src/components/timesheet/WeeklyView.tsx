import { useMemo, memo, useState } from 'react';
import { format } from 'date-fns';
import { Card } from '@/components/ui/Card';
import { Table, TableHeader, TableBody, Th } from '@/components/ui/Table';
import { Button } from '@/components/ui/Button';
import { Plus, Copy, Loader2, Clock } from 'lucide-react';
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
import { useCallback } from 'react';
import type { Project } from '@/types';
import { LoadingScreen } from '../ui/LoadingScreen';

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
    availableAssignments,
    isLoading,
    isCopying,
    committingCell,
    hasMonthlyApprovals,
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

  const weekDays = useMemo(() => {
    const days: Date[] = [];
    let currentDate = new Date(dateRange.start);
    while (currentDate <= dateRange.end) {
      days.push(new Date(currentDate));
      currentDate.setDate(currentDate.getDate() + 1);
    }
    return days;
  }, [dateRange]);

  const handleTabBetweenCells = useCallback((currentDate: string, shiftKey: boolean) => {
    const currentDateIndex = weekDays.findIndex(date => format(date, 'yyyy-MM-dd') === currentDate);
    
    // Get current row and cell info
    const [, projectId, taskId] = editingCell?.split('-') || [];
    const currentRowIndex = rows.findIndex(r => 
      r.projectId === projectId && r.taskId === taskId
    );
    
    // Calculate next cell position
    const nextDateIndex = shiftKey ? currentDateIndex - 1 : currentDateIndex + 1;
    let nextRow = currentRowIndex;
    let targetDateIndex = nextDateIndex;
    
    // Handle row transitions
    if (nextDateIndex < 0 && currentRowIndex > 0) {
      nextRow = currentRowIndex - 1;
      targetDateIndex = weekDays.length - 1;
    } else if (nextDateIndex >= weekDays.length && currentRowIndex < rows.length - 1) {
      nextRow = currentRowIndex + 1;
      targetDateIndex = 0;
    } else if (nextDateIndex < 0 || nextDateIndex >= weekDays.length) {
      return; // Don't move if we're at the edges
    }

    // Get target row and date
    const targetRow = rows[nextRow];
    const targetDate = format(weekDays[targetDateIndex], 'yyyy-MM-dd');

    if (targetRow) {
      const nextCellKey = `${targetDate}-${targetRow.projectId}-${targetRow.taskId}`;
      setEditingCell(nextCellKey);
      
      // Focus the next input after a brief delay to ensure React has updated
      setTimeout(() => {
        const nextInput = document.querySelector(`input[data-cell-key="${nextCellKey}"]`) as HTMLInputElement;
        if (nextInput) {
          nextInput.focus();
          nextInput.select();
        }
      }, 0);
    }
  }, [weekDays, editingCell, rows, setEditingCell]);

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

  // Ensure availableAssignments is defined before rendering rows
  if (!availableAssignments) {
    return <LoadingScreen />;
  }
  return (
    <Card>
      {isLoading && (
        <div className="absolute inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center z-10">
          <div className="flex flex-col items-center gap-3">
            <Clock className="h-8 w-8 text-indigo-500 animate-pulse" />
            <div className="text-sm font-medium text-gray-600">Loading timesheet...</div>
          </div>
        </div>
      )}
      <div className="relative">
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
                availableAssignments={availableAssignments}
                committingCell={committingCell}
                editingCell={editingCell}
                onUpdateRow={updateRow}
                onRemoveRow={handleDeleteRow}
                onCellChange={handleCellChange}
                onTabBetweenCells={handleTabBetweenCells}
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
                disabled={isCopying || hasMonthlyApprovals}
                title={hasMonthlyApprovals ? "Cannot copy entries when approvals exist for this month" : undefined}
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
      </div>
    </Card>
  );
});