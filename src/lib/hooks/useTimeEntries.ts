import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useCallback, useState, useMemo, useEffect } from 'react';
import { format, startOfMonth, endOfMonth } from 'date-fns';
import {
  getTimeEntries,
  createTimeEntry,
  updateTimeEntry,
  deleteTimeEntry,
} from '@/lib/services/timeEntries';
import { useProjects } from './useProjects';
import { useApprovals } from './useApprovals';
import { useEffectiveTimesheetUser } from '@/lib/contexts/EffectiveTimesheetUserContext';
import type { TimeEntry } from '@/types';

const QUERY_KEY = 'timeEntries';

interface TimesheetRow {
  clientId: string;
  projectId: string;
  taskId: string;
}

interface WeeklyRows {
  [weekKey: string]: TimesheetRow[];
}

interface UseTimeEntriesOptions {
  userId?: string | null;
  dateRange?: {
    start: Date;
    end: Date;
  };
}

export function useTimeEntries({ userId, dateRange }: UseTimeEntriesOptions = {}) {
  const queryClient = useQueryClient();
  const [editingCell, setEditingCell] = useState<string | null>(null);
  const [manualRows, setManualRows] = useState<WeeklyRows>({});
  const [isCopying, setIsCopying] = useState(false);
  const { projects } = useProjects();
  const { approvals } = useApprovals();
  const { effectiveTimesheetUser } = useEffectiveTimesheetUser();
  const effectiveUserId = effectiveTimesheetUser?.id;

  // Reset manual rows when effective user changes
  useEffect(() => {
    setManualRows({});
    // Also invalidate time entries query when user changes
    queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
  }, [effectiveUserId]);

  // Get current week key
  const weekKey = dateRange 
    ? format(dateRange.start, 'yyyy-MM-dd')
    : '';

  // Get available projects and tasks for the user
  const availableAssignments = useMemo(() => {
    if (!effectiveUserId || !projects) return [];
    
    return projects.flatMap(project => 
      project.tasks.flatMap(task => {
        const assignment = task.userAssignments?.find(a => a.userId === effectiveUserId);
        if (!assignment) return [];
        
        return [{
          clientId: project.clientId,
          projectId: project.id,
          taskId: task.id,
          projectName: project.name,
          taskName: task.name
        }];
      })
    );
  }, [effectiveUserId, projects]);

  const createMutation = useMutation({
    mutationFn: createTimeEntry,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
    },
    onError: (error) => {
      console.error('Error creating time entry:', error);
    }
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<TimeEntry> }) => updateTimeEntry(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
    },
    onError: (error) => {
      console.error('Error updating time entry:', error);
    }
  });

  const deleteMutation = useMutation({
    mutationFn: deleteTimeEntry,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
    },
    onError: (error) => {
      console.error('Error deleting time entry:', error);
    }
  });

  const handleCreateEntry = useCallback(async (data: Omit<TimeEntry, 'id'>) => {
    return createMutation.mutateAsync({
      ...data,
      userId: effectiveUserId
    });
  }, [createMutation]);

  const handleUpdateEntry = useCallback(async (id: string, data: Partial<TimeEntry>) => {
    return updateMutation.mutateAsync({ id, data });
  }, [updateMutation]);

  const handleDeleteEntry = useCallback(async (id: string) => {
    return deleteMutation.mutateAsync(id);
  }, [deleteMutation]);

  const query = useQuery({
    queryKey: [QUERY_KEY, effectiveUserId, dateRange?.start, dateRange?.end],
    queryFn: () => getTimeEntries(effectiveUserId, dateRange),
    enabled: !!effectiveUserId && !!dateRange,
  });

  const timeEntries = useMemo(() => query.data || [], [query.data]);

  const handleCellChange = useCallback(async (
    date: string,
    row: TimesheetRow,
    value: number | null
  ) => {
    if (!effectiveUserId || !row.clientId || !row.projectId || !row.taskId) return;
    const weekKey = format(dateRange.start, 'yyyy-MM-dd');

    // Find existing entry
    const entry = timeEntries.find(e => 
      e.date === date && 
      e.clientId === row.clientId &&
      e.projectId === row.projectId &&
      e.taskId === row.taskId
    );

    // Optimistically update local state
    const optimisticUpdate = {
      queryKey: [QUERY_KEY, effectiveUserId, dateRange?.start, dateRange?.end],
      updater: (old: TimeEntry[]) => {
        if (!old) return old;
        
        if (entry) {
          // Update existing entry
          if (value === null) {
            // Remove entry
            return old.filter(e => e.id !== entry.id);
          } else {
            // Update hours
            return old.map(e => 
              e.id === entry.id 
                ? { ...e, hours: value, updatedAt: new Date().toISOString() }
                : e
            );
          }
        } else if (value !== null) {
          // Add new entry
          const newEntry: TimeEntry = {
            id: crypto.randomUUID(), // Temporary ID
            userId: effectiveUserId,
            date,
            clientId: row.clientId,
            projectId: row.projectId,
            taskId: row.taskId,
            hours: value,
            description: '',
          };
          return [...old, newEntry];
        }
        return old;
      }
    };

    // Immediately update cache
    queryClient.setQueryData(optimisticUpdate.queryKey, optimisticUpdate.updater);

    try {
      if (entry) {
        if (value === null) {
          await handleDeleteEntry(entry.id);
        } else {
          await handleUpdateEntry(entry.id, { 
            hours: value,
            updatedAt: new Date().toISOString()
          });
        }
      } else if (value !== null) {
        await handleCreateEntry({
          userId: effectiveUserId,
          date,
          clientId: row.clientId,
          projectId: row.projectId,
          taskId: row.taskId,
          hours: value,
          description: '',
        });
        
        // Remove the manual row after creating a time entry
        setManualRows(current => ({
          ...current,
          [weekKey]: (current[weekKey] || []).filter(manualRow => 
            !(manualRow.clientId === row.clientId && 
              manualRow.projectId === row.projectId && 
              manualRow.taskId === row.taskId)
          )
        }));
      }
    } catch (error) {
      // On error, rollback to previous state
      queryClient.setQueryData(
        optimisticUpdate.queryKey,
        timeEntries
      );
      console.error('Error updating time entry:', error);
    }
  }, [effectiveUserId, timeEntries, dateRange, handleCreateEntry, handleUpdateEntry, handleDeleteEntry, queryClient]);

  const hasEntriesForCurrentWeek = useMemo(() => {
    if (!dateRange) return false;
    return timeEntries.some(entry => {
      const entryDate = new Date(entry.date);
      return entryDate >= dateRange.start && entryDate <= dateRange.end;
    });
  }, [timeEntries, dateRange]);

  // Check if there are any pending or approved approvals for the month
  const hasMonthlyApprovals = useMemo(() => {
    if (!dateRange || !effectiveUserId) return false;
    
    const monthStart = format(startOfMonth(dateRange.start), 'yyyy-MM-dd');
    const monthEnd = format(endOfMonth(dateRange.start), 'yyyy-MM-dd');
    
    return approvals.some(approval => 
      approval.userId === effectiveUserId &&
      (approval.status === 'pending' || approval.status === 'approved') &&
      approval.startDate === monthStart &&
      approval.endDate === monthEnd
    );
  }, [approvals, dateRange, effectiveUserId]);
  const copyFromPreviousWeek = useCallback(async () => {
    if (!effectiveUserId || !dateRange) return;
    if (isCopying) return; // Prevent multiple simultaneous copies
    if (hasMonthlyApprovals) return; // Prevent copying if approvals exist
    
    setIsCopying(true);

    const previousWeekStart = new Date(dateRange.start);
    previousWeekStart.setDate(previousWeekStart.getDate() - 7);
    const previousWeekEnd = new Date(dateRange.end);
    previousWeekEnd.setDate(previousWeekEnd.getDate() - 7);

    try {
      // Get previous week's entries
      const previousEntries = await getTimeEntries(effectiveUserId, {
        start: previousWeekStart,
        end: previousWeekEnd
      });

      // Create new entries for current week
      const promises = previousEntries.map(entry => {
        const entryDate = new Date(entry.date);
        const newDate = new Date(entryDate);
        newDate.setDate(newDate.getDate() + 7);

        return handleCreateEntry({
          userId: effectiveUserId,
          date: newDate.toISOString().split('T')[0],
          clientId: entry.clientId,
          projectId: entry.projectId,
          taskId: entry.taskId,
          hours: entry.hours,
          description: entry.description || '',
        });
      });

      await Promise.all(promises);
    } catch (error) {
      console.error('Error copying from previous week:', error);
    } finally {
      setIsCopying(false);
    }
  }, [effectiveUserId, dateRange, handleCreateEntry, isCopying]);

  // Combine automatic and manual rows
  const rows = useMemo(() => {
    const uniqueRowKeys = new Set();
    const allRows: TimesheetRow[] = [];
    const currentWeekManualRows = manualRows[weekKey] || [];
    
    // Only add rows from existing time entries
    timeEntries.forEach(entry => {
      const rowKey = `${entry.clientId}-${entry.projectId}-${entry.taskId}`;
      if (!uniqueRowKeys.has(rowKey)) {
        uniqueRowKeys.add(rowKey);
        allRows.push({
          clientId: entry.clientId,
          projectId: entry.projectId,
          taskId: entry.taskId,
        });
      }
    });
    
    // Add manually added rows
    currentWeekManualRows.forEach(row => {
      allRows.push(row);
    });

    return allRows;
  }, [timeEntries, manualRows, weekKey]);

  const addRow = useCallback(() => {
    setManualRows(current => ({
      ...current,
      [weekKey]: [...(current[weekKey] || []), { clientId: '', projectId: '', taskId: '' }]
    }));
  }, [weekKey]);
  
  const removeRow = useCallback((index: number) => {
    const row = rows[index];
    const rowEntries = timeEntries.filter(entry =>
      entry.clientId === row.clientId &&
      entry.projectId === row.projectId &&
      entry.taskId === row.taskId
    );

    if (rowEntries.length > 0) {
      // Delete all entries for this row
      Promise.all(rowEntries.map(entry => handleDeleteEntry(entry.id)))
        .then(() => {
          setManualRows(current => ({
            ...current,
            [weekKey]: (current[weekKey] || []).filter((_, i) => i !== (index - (rows.length - (current[weekKey] || []).length)))
          }));
        })
        .catch(error => {
          console.error('Error deleting time entries:', error);
          alert('Failed to delete time entries');
        });
    } else {
      // Just remove the manual row if no entries exist
      setManualRows(current => ({
        ...current,
        [weekKey]: (current[weekKey] || []).filter((_, i) => i !== (index - (rows.length - (current[weekKey] || []).length)))
      }));
    }
  }, [rows, timeEntries, handleDeleteEntry, weekKey]);

  const updateRow = useCallback((index: number, updates: Partial<TimesheetRow>) => {
    // Only update if it's a manual row
    const currentWeekManualRows = manualRows[weekKey] || [];
    const uniqueRowCount = rows.length - currentWeekManualRows.length;
    if (index >= uniqueRowCount) {
      setManualRows(current => {
        const currentRows = current[weekKey] || [];
        const manualIndex = index - uniqueRowCount;
        const newRows = [...currentRows];
        if ('clientId' in updates) {
          newRows[manualIndex] = { 
            clientId: updates.clientId || '',
            projectId: '',
            taskId: ''
          };
        } else if ('projectId' in updates) {
          newRows[manualIndex] = { 
            ...newRows[manualIndex],
            projectId: updates.projectId || '',
            taskId: ''
          };
        } else {
          newRows[manualIndex] = { ...newRows[manualIndex], ...updates };
        }
        return {
          ...current,
          [weekKey]: newRows
        };
      });
    }
  }, [rows.length, manualRows, weekKey]);

  return {
    timeEntries,
    rows,
    editingCell,
    isCopying,
    hasMonthlyApprovals,
    isLoading: query.isLoading,
    error: query.error,
    addRow,
    removeRow,
    copyFromPreviousWeek,
    hasEntriesForCurrentWeek,
    updateRow,
    handleCellChange,
    setEditingCell,
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
  };
}