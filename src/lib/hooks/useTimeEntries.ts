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
  const [committingCell, setCommittingCell] = useState<string | null>(null);
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
    
    // Include all assignments but mark inactive ones
    const assignments = projects
      // Filter for active projects with valid dates
      .filter(project => {
        const isActive = project.isActive;
        const hasEndDate = project.endDate && project.endDate.trim().length === 10; // YYYY-MM-DD format
        const endDate = hasEndDate ? new Date(project.endDate + 'T23:59:59') : null; // Set to end of day
        const today = new Date();
        today.setHours(0, 0, 0, 0); // Set to start of day for fair comparison
        const isEndDateInFuture = endDate ? endDate >= today : true;
        
        return isActive && (!hasEndDate || isEndDateInFuture);
      })
      .flatMap(project => project.tasks.flatMap(task => {
        const assignment = task.userAssignments?.find(a => a.userId === effectiveUserId);
        if (!assignment) return [];

        return [{
          clientId: project.clientId,
          projectId: project.id,
          taskId: task.id,
          projectName: project.name,
          taskName: task.name,
          isActive: assignment.isActive !== false // treat undefined as active for backward compatibility
        }];
      })
               )

    return assignments;
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
    
    const cellKey = `${date}-${row.projectId}-${row.taskId}`;
    setCommittingCell(cellKey);

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
      if (error.code === 'not-found') {
        // If entry not found, try to create a new one
        try {
          if (value !== null) {
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
        } catch (createError) {
          console.error('Error creating time entry after update failed:', createError);
        }
      } else {
        console.error('Error updating time entry:', error);
      }
    }
    setCommittingCell(null);
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
    
    const currentStart = format(dateRange.start, 'yyyy-MM-dd');
    const currentEnd = format(dateRange.end, 'yyyy-MM-dd');
    
    // Group approvals by project
    const projectApprovals = new Map();
    approvals.forEach(approval => {
      if (approval.userId !== effectiveUserId) return;
      
      // Check if approval period overlaps with current week
      if (approval.startDate > currentEnd || approval.endDate < currentStart) return;
      
      const key = approval.project?.id;
      if (!projectApprovals.has(key)) {
        projectApprovals.set(key, []);
      }
      projectApprovals.get(key).push(approval);
    });
    
    // Check if any project has a pending or approved status in its most recent approval
    return Array.from(projectApprovals.values()).some(projectApprovalList => {
      // Sort by submittedAt timestamp, handling Firestore timestamp format
      const sortedApprovals = projectApprovalList.sort((a, b) => {
        // Handle both Firestore timestamp and ISO string formats
        const getTime = (timestamp: any) => {
          if (timestamp?.seconds) {
            return timestamp.seconds * 1000 + (timestamp.nanoseconds || 0) / 1000000;
          }
          return new Date(timestamp).getTime();
        };
        return getTime(b.submittedAt) - getTime(a.submittedAt);
      });
      
      const latestApproval = sortedApprovals[0];
      return latestApproval?.status === 'pending' || latestApproval?.status === 'approved';
    });
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

      // Filter out entries for inactive projects or task assignments
      const activeEntries = previousEntries.filter(entry => {
        // Check if project is active
        const project = projects.find(p => p.id === entry.projectId);
        if (!project?.isActive) return false;

        // Check if task assignment is active
        const assignment = availableAssignments.find(a =>
          a.clientId === entry.clientId &&
          a.projectId === entry.projectId &&
          a.taskId === entry.taskId
        );
        return assignment?.isActive !== false;
      });

      // Create new entries for current week
      const promises = activeEntries.map(entry => {
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
  }, [effectiveUserId, dateRange, handleCreateEntry, isCopying, projects, availableAssignments]);

  // Combine automatic and manual rows
  const rows = useMemo(() => {
    const uniqueRowMap = new Map<string, TimesheetRow>();
    
    // Only add rows from existing time entries
    timeEntries.forEach(entry => {
      const rowKey = `${entry.clientId}-${entry.projectId}-${entry.taskId}`;
      if (!uniqueRowMap.has(rowKey)) {
        uniqueRowMap.set(rowKey, {
          clientId: entry.clientId,
          projectId: entry.projectId,
          taskId: entry.taskId,
        });
      }
    });
    
    // Add manual rows that don't already exist
    const currentWeekManualRows = manualRows[weekKey] || [];
    currentWeekManualRows.forEach(row => {
      const rowKey = `${row.clientId}-${row.projectId}-${row.taskId}`;
      if (!uniqueRowMap.has(rowKey)) {
        uniqueRowMap.set(rowKey, row);
      }
    });

    return Array.from(uniqueRowMap.values());
  }, [timeEntries, manualRows, weekKey]);
  
  const addRow = useCallback(() => {
    // Check if there are any empty rows that need to be filled first
    const currentWeekManualRows = manualRows[weekKey] || [];
    const hasEmptyRow = currentWeekManualRows.some(row => !row.clientId);
    if (hasEmptyRow) return;

    // Get all existing combinations from both time entries and manual rows
    const existingCombinations = new Set();

    // Add combinations from time entries
    timeEntries.forEach(entry => {
      const combination = `${entry.clientId}-${entry.projectId}-${entry.taskId}`;
      existingCombinations.add(combination);
    });

    // Add combinations from manual rows
    currentWeekManualRows.forEach(row => {
      if (row.clientId && row.projectId && row.taskId) {
        const combination = `${row.clientId}-${row.projectId}-${row.taskId}`;
        existingCombinations.add(combination);
      }
    });

    // Only add a new row if there are available combinations
    const availableCombinations = availableAssignments.filter(assignment => {
      const combination = `${assignment.clientId}-${assignment.projectId}-${assignment.taskId}`;
      return !existingCombinations.has(combination);
    });

    if (availableCombinations.length === 0) {
      console.warn('All available client/project/task combinations are already in use');
      return;
    }

    setManualRows(current => ({
      ...current,
      [weekKey]: [...(current[weekKey] || []), { clientId: '', projectId: '', taskId: '' }]
    }));
  }, [weekKey, timeEntries, manualRows, availableAssignments]);
  
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
      // Check if this update would create a duplicate combination
      const manualIndex = index - uniqueRowCount;
      const currentRow = currentWeekManualRows[manualIndex];
      const updatedRow = {
        ...currentRow,
        ...updates
      };

      // Only check for duplicates if we have a complete row
      if (updatedRow.clientId && updatedRow.projectId && updatedRow.taskId) {
        const combination = `${updatedRow.clientId}-${updatedRow.projectId}-${updatedRow.taskId}`;
        
        // Check time entries for duplicates
        const existsInTimeEntries = timeEntries.some(entry =>
          entry.clientId === updatedRow.clientId &&
          entry.projectId === updatedRow.projectId &&
          entry.taskId === updatedRow.taskId
        );

        // Check other manual rows for duplicates
        const existsInManualRows = currentWeekManualRows.some((row, idx) =>
          idx !== manualIndex &&
          row.clientId === updatedRow.clientId &&
          row.projectId === updatedRow.projectId &&
          row.taskId === updatedRow.taskId
        );

        if (existsInTimeEntries || existsInManualRows) {
          console.warn('This client/project/task combination already exists');
          return;
        }
      }

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
  }, [rows.length, manualRows, weekKey, timeEntries]);

  return {
    timeEntries,
    rows,
    availableAssignments,
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
    committingCell,
    isDeleting: deleteMutation.isPending,
  };
}