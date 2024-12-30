import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useCallback, useState, useMemo } from 'react';
import {
  getTimeEntries,
  createTimeEntry,
  updateTimeEntry,
  deleteTimeEntry,
} from '@/lib/services/timeEntries';
import { auth } from '@/lib/firebase';
import type { TimeEntry } from '@/types';

const QUERY_KEY = 'timeEntries';

interface TimesheetRow {
  clientId: string;
  projectId: string;
  roleId: string;
}

interface UseTimeEntriesOptions {
  userId?: string;
  dateRange?: {
    start: Date;
    end: Date;
  };
}

export function useTimeEntries(options: UseTimeEntriesOptions = {}) {
  const userId = auth.currentUser?.uid;
  const queryClient = useQueryClient();
  const [editingCell, setEditingCell] = useState<string | null>(null);
  const [manualRows, setManualRows] = useState<TimesheetRow[]>([
    { clientId: '', projectId: '', roleId: '' }
  ]);

  const query = useQuery({
    queryKey: [QUERY_KEY, userId, options.dateRange?.start, options.dateRange?.end],
    queryFn: () => getTimeEntries(userId, options.dateRange),
    enabled: !!userId && !!options.dateRange,
  });

  const timeEntries = useMemo(() => query.data || [], [query.data]);

  // Combine automatic and manual rows
  const rows = useMemo(() => {
    console.log('🔄 Computing rows from:', { 
      timeEntries: timeEntries.length,
      manualRows: manualRows.length 
    });
    // Get unique rows from existing time entries
    const uniqueRows = timeEntries.reduce((acc: TimesheetRow[], entry) => {
      const rowKey = `${entry.clientId}-${entry.projectId}-${entry.roleId}`;
      if (!acc.find(row => 
        row.clientId === entry.clientId && 
        row.projectId === entry.projectId && 
        row.roleId === entry.roleId
      )) {
        acc.push({
          clientId: entry.clientId,
          projectId: entry.projectId,
          roleId: entry.roleId,
        });
      }
      return acc;
    }, []);

    console.log('📋 Generated rows:', {
      uniqueRows: uniqueRows.length,
      manualRows: manualRows.length,
      total: [...uniqueRows, ...manualRows].length
    });
    // Combine unique rows from entries with manual rows
    return [...uniqueRows, ...manualRows];
  }, [timeEntries, manualRows]);


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
    mutationFn: updateTimeEntry,
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
    return createMutation.mutateAsync(data);
  }, [createMutation]);

  const handleUpdateEntry = useCallback(async (id: string, data: Partial<TimeEntry>) => {
    return updateMutation.mutateAsync(id, data);
  }, [updateMutation]);

  const handleDeleteEntry = useCallback(async (id: string) => {
    return deleteMutation.mutateAsync(id);
  }, [deleteMutation]);

  const handleCellChange = useCallback(async (
    date: string,
    row: TimesheetRow,
    value: number | null
  ) => {
    console.log('🎯 Cell change:', { date, row, value });
    if (!userId || !row.clientId || !row.projectId || !row.roleId) return;

    const entry = timeEntries.find(e => 
      e.date === date && 
      e.clientId === row.clientId &&
      e.projectId === row.projectId &&
      e.roleId === row.roleId
    );
    console.log('🔍 Found existing entry:', entry);

    if (entry) {
      if (value === null) {
        console.log('🗑️ Deleting entry');
        await handleDeleteEntry(entry.id);
      } else {
        console.log('📝 Updating entry');
        await handleUpdateEntry(entry.id, { hours: value });
      }
    } else if (value !== null) {
      console.log('➕ Creating new entry');
      await handleCreateEntry({
        userId,
        date,
        clientId: row.clientId,
        projectId: row.projectId,
        roleId: row.roleId,
        hours: value,
        description: '',
      });
    }
  }, [userId, timeEntries, handleCreateEntry, handleUpdateEntry, handleDeleteEntry]);

  const addRow = useCallback(() => {
    setManualRows(current => [...current, { clientId: '', projectId: '', roleId: '' }]);
  }, []);
  
  const removeRow = useCallback((index: number) => {
    // Only remove if it's a manual row
    const uniqueRowCount = rows.length - manualRows.length;
    if (index >= uniqueRowCount) {
      setManualRows(current => current.filter((_, i) => i !== (index - uniqueRowCount)));
    }
  }, [rows.length, manualRows.length]);

  const updateRow = useCallback((index: number, updates: Partial<TimesheetRow>) => {
    // Only update if it's a manual row
    const uniqueRowCount = rows.length - manualRows.length;
    if (index >= uniqueRowCount) {
      setManualRows(current => {
        const manualIndex = index - uniqueRowCount;
        const newRows = [...current];
      if ('clientId' in updates) {
        newRows[manualIndex] = { 
          clientId: updates.clientId || '',
          projectId: '',
          roleId: ''
        };
      } else if ('projectId' in updates) {
        newRows[manualIndex] = { 
          ...newRows[manualIndex],
          projectId: updates.projectId || '',
          roleId: ''
        };
      } else {
        newRows[manualIndex] = { ...newRows[manualIndex], ...updates };
      }
      return newRows;
    });
    }
  }, [rows.length, manualRows.length]);

  return {
    timeEntries,
    rows,
    editingCell,
    isLoading: query.isLoading,
    error: query.error,
    addRow,
    removeRow,
    updateRow,
    handleCellChange,
    setEditingCell,
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
  };
}