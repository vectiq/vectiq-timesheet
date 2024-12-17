import { useState, useMemo } from 'react';
import { startOfWeek, addDays, subWeeks, format } from 'date-fns';
import type { Project, TimeEntry } from '@/types';

interface TimesheetRow {
  projectId: string;
  roleId: string;
  hours: Record<string, string>;
}

export function useWeeklyTimesheet(projects: Project[], timeEntries: TimeEntry[]) {
  const [rows, setRows] = useState<TimesheetRow[]>([{ projectId: '', roleId: '', hours: {} }]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const weekStart = useMemo(() => startOfWeek(new Date(), { weekStartsOn: 1 }), []);
  const weekDates = useMemo(() => 
    Array.from({ length: 7 }, (_, i) => addDays(weekStart, i)),
    [weekStart]
  );

  const addRow = () => {
    setRows([...rows, { projectId: '', roleId: '', hours: {} }]);
  };

  const updateRow = (index: number, updates: Partial<TimesheetRow>) => {
    const newRows = [...rows];
    newRows[index] = { ...newRows[index], ...updates };
    setRows(newRows);
  };

  const removeRow = (index: number) => {
    setRows(rows.filter((_, i) => i !== index));
  };

  const totalHours = useMemo(() => {
    return rows.reduce((total, row) => {
      const rowTotal = Object.values(row.hours)
        .reduce((sum, value) => sum + (parseFloat(value) || 0), 0);
      return total + rowTotal;
    }, 0).toFixed(2);
  }, [rows]);

  const saveTimesheet = async () => {
    setIsSubmitting(true);
    try {
      // Save logic here
      console.log('Saving timesheet:', rows);
    } finally {
      setIsSubmitting(false);
    }
  };

  const submitTimesheet = async () => {
    setIsSubmitting(true);
    try {
      // Submit logic here
      console.log('Submitting timesheet:', rows);
    } finally {
      setIsSubmitting(false);
    }
  };

  const copyPreviousWeek = () => {
    const prevWeekStart = subWeeks(weekStart, 1);
    const prevWeekEntries = timeEntries.filter(entry => {
      const entryDate = new Date(entry.date);
      return entryDate >= prevWeekStart && entryDate < weekStart;
    });

    const newRows = prevWeekEntries.map(entry => ({
      projectId: entry.projectId,
      roleId: entry.projectRoleId,
      hours: { [entry.date]: entry.hours.toString() },
    }));

    setRows(newRows.length > 0 ? newRows : [{ projectId: '', roleId: '', hours: {} }]);
  };

  return {
    weekDates,
    rows,
    addRow,
    updateRow,
    removeRow,
    totalHours,
    saveTimesheet,
    submitTimesheet,
    copyPreviousWeek,
    isSubmitting,
  };
}