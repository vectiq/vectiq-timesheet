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
  const [rows, setRows] = useState<TimesheetRow[]>([
    { clientId: '', projectId: '', roleId: '' }
  ]);

  const query = useQuery({
    queryKey: [QUERY_KEY, userId, options.dateRange?.start, options.dateRange?.end],
    queryFn: () => getTimeEntries(userId, options.dateRange)
  });

  // Initialize rows from time entries
  useMemo(() => {
    const uniqueRows = query.data?.reduce((acc: TimesheetRow[], entry) => {
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
    }, []) || [];

    if (uniqueRows.length > 0) {
      setRows(uniqueRows);
    }
  }, [query.data]);

  const createMutation = useMutation({
    mutationFn: createTimeEntry,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
    }
  });

  const updateMutation = useMutation({
    mutationFn: updateTimeEntry,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
    }
  });

  const deleteMutation = useMutation({
    mutationFn: deleteTimeEntry,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
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
    if (!userId || !row.clientId || !row.projectId || !row.roleId) return;

    const entry = query.data?.find(e => 
      e.date === date && 
      e.clientId === row.clientId &&
      e.projectId === row.projectId &&
      e.roleId === row.roleId
    );

    if (entry) {
      if (value === null) {
        await handleDeleteEntry(entry.id);
      } else {
        await handleUpdateEntry(entry.id, { hours: value });
      }
    } else if (value !== null) {
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
  }, [userId, query.data, handleCreateEntry, handleUpdateEntry, handleDeleteEntry]);

  const addRow = useCallback(() => {
    setRows(current => [...current, { clientId: '', projectId: '', roleId: '' }]);
  }, []);

  const removeRow = useCallback((index: number) => {
    setRows(current => current.filter((_, i) => i !== index));
  }, []);

  const updateRow = useCallback((index: number, updates: Partial<TimesheetRow>) => {
    setRows(current => {
      const newRows = [...current];
      if ('clientId' in updates) {
        newRows[index] = { 
          clientId: updates.clientId || '',
          projectId: '',
          roleId: ''
        };
      } else if ('projectId' in updates) {
        newRows[index] = { 
          ...newRows[index],
          projectId: updates.projectId || '',
          roleId: ''
        };
      } else {
        newRows[index] = { ...newRows[index], ...updates };
      }
      return newRows;
    });
  }, []);

  return {
    timeEntries: query.data ?? [],
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