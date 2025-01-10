import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useCallback, useState, useMemo, useEffect } from 'react';
import { format } from 'date-fns';
import {
  getTimeEntries,
  createTimeEntry,
  updateTimeEntry,
  deleteTimeEntry,
} from '@/lib/services/timeEntries';
import { useUsers } from './useUsers';
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
  const { effectiveUser } = useUsers();
  const effectiveUserId = userId || effectiveUser?.id;
  const queryClient = useQueryClient();
  const [editingCell, setEditingCell] = useState<string | null>(null);
  const [manualRows, setManualRows] = useState<WeeklyRows>({});

  // Reset manual rows when effective user changes
  useEffect(() => {
    setManualRows({});
  }, [effectiveUserId]);

  // Get current week key
  const weekKey = dateRange 
    ? format(dateRange.start, 'yyyy-MM-dd')
    : '';

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

  const hasEntriesForCurrentWeek = useMemo(() => {
    if (!dateRange) return false;
    return timeEntries.some(entry => {
      const entryDate = new Date(entry.date);
      return entryDate >= dateRange.start && entryDate <= dateRange.end;
    });
  }, [timeEntries, dateRange]);

  const copyFromPreviousWeek = useCallback(async () => {
    if (!effectiveUserId || !dateRange) return;

    const previousWeekStart = new Date(dateRange.start);
    previousWeekStart.setDate(previousWeekStart.getDate() - 7);
    const previousWeekEnd = new Date(dateRange.end);
    previousWeekEnd.setDate(previousWeekEnd.getDate() - 7);

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
  }, [effectiveUserId, dateRange, handleCreateEntry]);

  // Combine automatic and manual rows
  const rows = useMemo(() => {
    // Get unique rows from existing time entries
    const uniqueRowKeys = new Set();
    const allRows: TimesheetRow[] = [];
    const currentWeekManualRows = manualRows[weekKey] || [];
    
    // Add rows from time entries
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
    
    // Add manual rows that don't already exist
    currentWeekManualRows.forEach(row => {
      const rowKey = `${row.clientId}-${row.projectId}-${row.taskId}`;
      if (!uniqueRowKeys.has(rowKey) && (row.clientId || row.projectId || row.taskId)) {
        uniqueRowKeys.add(rowKey);
        allRows.push(row);
      }
    });

    // Add empty manual rows at the end
    currentWeekManualRows.forEach(row => {
      if (!row.clientId && !row.projectId && !row.taskId) {
        allRows.push(row);
      }
    });

    return allRows;
  }, [timeEntries, manualRows, weekKey]);

  const handleCellChange = useCallback(async (
    date: string,
    row: TimesheetRow,
    value: number | null
  ) => {
    if (!effectiveUserId || !row.clientId || !row.projectId || !row.taskId) return;

    const entry = timeEntries.find(e => 
      e.date === date && 
      e.clientId === row.clientId &&
      e.projectId === row.projectId &&
      e.taskId === row.taskId
    );

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
    }
  }, [effectiveUserId, timeEntries, handleCreateEntry, handleUpdateEntry, handleDeleteEntry]);

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
      if (!window.confirm('This will delete all time entries for this row. Are you sure?')) {
        return;
      }
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