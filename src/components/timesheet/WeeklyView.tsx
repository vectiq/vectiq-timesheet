import { useMemo, useState } from 'react';
import { format, subWeeks, isSameWeek } from 'date-fns';
import { Card } from '@/components/ui/Card';
import { Table, TableHeader, TableBody, Th, Td } from '@/components/ui/Table';
import { Button } from '@/components/ui/Button';
import { Plus, Copy } from 'lucide-react';
import { useTimeEntries } from '@/lib/hooks/useTimeEntries';
import { useFilteredTimeEntries } from '@/lib/hooks/useFilteredTimeEntries';
import { TimesheetRow } from './TimesheetRow';
import type { Project } from '@/types';

interface WeeklyViewProps {
  projects: Project[];
  dateRange: {
    start: Date;
    end: Date;
  };
}

interface TimesheetRowData {
  id: string;
  clientId: string;
  projectId: string;
  roleId: string;
  hours: Record<string, number | null>;
}

export function WeeklyView({ projects, dateRange }: WeeklyViewProps) {
  const { timeEntries, createTimeEntry, updateTimeEntry, deleteTimeEntry } = useTimeEntries();
  const weekKey = format(dateRange.start, 'yyyy-MM-dd');
  
  // Store rows in a map keyed by week start date
  const [weekRows, setWeekRows] = useState<Record<string, TimesheetRowData[]>>({
    [weekKey]: [{
      id: crypto.randomUUID(),
      clientId: '',
      projectId: '',
      roleId: '',
      hours: {},
    }]
  });

  const currentWeekEntries = useFilteredTimeEntries({
    timeEntries,
    dateRange
  });

  // Get previous week's entries
  const previousWeekRange = {
    start: subWeeks(dateRange.start, 1),
    end: subWeeks(dateRange.end, 1)
  };
  const previousWeekEntries = useFilteredTimeEntries({
    timeEntries,
    dateRange: previousWeekRange
  });

  const [editingCell, setEditingCell] = useState<string | null>(null);

  const weekDays = useMemo(() => {
    const days: Date[] = [];
    let currentDate = new Date(dateRange.start);
    while (currentDate <= dateRange.end) {
      days.push(new Date(currentDate));
      currentDate.setDate(currentDate.getDate() + 1);
    }
    return days;
  }, [dateRange]);

  // Check if current view is the current week
  const isCurrentWeek = useMemo(() => {
    const today = new Date();
    return isSameWeek(dateRange.start, today, { weekStartsOn: 1 });
  }, [dateRange.start]);

  // Get rows for current week, initialize if not exists
  const rows = useMemo(() => {
    if (!weekRows[weekKey]) {
      setWeekRows(prev => ({
        ...prev,
        [weekKey]: [{
          id: crypto.randomUUID(),
          clientId: '',
          projectId: '',
          roleId: '',
          hours: {},
        }]
      }));
      return [{
        id: crypto.randomUUID(),
        clientId: '',
        projectId: '',
        roleId: '',
        hours: {},
      }];
    }
    return weekRows[weekKey];
  }, [weekKey, weekRows]);

  // Calculate weekly total
  const weeklyTotal = useMemo(() => 
    rows.reduce((total, row) => 
      total + Object.values(row.hours).reduce((sum, hours) => 
        sum + (hours || 0), 
        0
      ), 
      0
    ),
    [rows]
  );

  const handleAddRow = () => {
    setWeekRows(prev => ({
      ...prev,
      [weekKey]: [...prev[weekKey], {
        id: crypto.randomUUID(),
        clientId: '',
        projectId: '',
        roleId: '',
        hours: {},
      }]
    }));
  };

  const handleRemoveRow = (rowId: string) => {
    setWeekRows(prev => ({
      ...prev,
      [weekKey]: prev[weekKey].filter(row => row.id !== rowId)
    }));
  };

  const handleHoursChange = async (rowId: string, date: string, hours: number | null) => {
    const row = rows.find(r => r.id === rowId);
    if (!row || !row.projectId || !row.roleId) return;

    setWeekRows(prev => ({
      ...prev,
      [weekKey]: prev[weekKey].map(r => 
        r.id === rowId 
          ? { ...r, hours: { ...r.hours, [date]: hours } }
          : r
      )
    }));

    const existingEntry = currentWeekEntries.find(e => 
      e.date === date && 
      e.projectId === row.projectId && 
      e.roleId === row.roleId
    );

    if (hours === null && existingEntry) {
      await deleteTimeEntry(existingEntry.id);
    } else if (hours !== null) {
      if (existingEntry) {
        await updateTimeEntry({
          ...existingEntry,
          hours,
        });
      } else {
        await createTimeEntry({
          projectId: row.projectId,
          roleId: row.roleId,
          clientId: row.clientId,
          date,
          hours,
          userId: 'user_1',
          description: '',
        });
      }
    }
  };

  const handleCopyPreviousWeek = () => {
    // Group previous week entries by project and role
    const groupedEntries = previousWeekEntries.reduce((acc, entry) => {
      const key = `${entry.clientId}-${entry.projectId}-${entry.roleId}`;
      if (!acc[key]) {
        acc[key] = {
          clientId: entry.clientId,
          projectId: entry.projectId,
          roleId: entry.roleId,
          hours: {},
        };
      }
      acc[key].hours[entry.date] = entry.hours;
      return acc;
    }, {} as Record<string, Omit<TimesheetRowData, 'id'>>);

    // Create new rows from grouped entries
    const newRows = Object.values(groupedEntries).map(row => ({
      ...row,
      id: crypto.randomUUID(),
      // Shift dates forward by one week
      hours: Object.entries(row.hours).reduce((acc, [date, hours]) => {
        const newDate = format(
          new Date(new Date(date).getTime() + 7 * 24 * 60 * 60 * 1000),
          'yyyy-MM-dd'
        );
        acc[newDate] = hours;
        return acc;
      }, {} as Record<string, number>),
    }));

    setWeekRows(prev => ({
      ...prev,
      [weekKey]: newRows.length > 0 ? newRows : [{
        id: crypto.randomUUID(),
        clientId: '',
        projectId: '',
        roleId: '',
        hours: {},
      }]
    }));
  };

  return (
    <Card>
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <tr className="border-b border-gray-200">
              <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 w-[200px]">Client</th>
              <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 w-[200px]">Project</th>
              <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 w-[200px]">Role</th>
              {weekDays.map(day => (
                <th key={day.toISOString()} scope="col" className="px-3 py-3.5 text-center text-sm font-semibold text-gray-900 w-[100px]">
                  <div>{format(day, 'EEE')}</div>
                  <div className="text-gray-500">{format(day, 'MMM d')}</div>
                </th>
              ))}
              <th scope="col" className="px-3 py-3.5 text-center text-sm font-semibold text-gray-900 w-[100px]">Total</th>
              <th scope="col" className="px-3 py-3.5 w-[50px]"></th>
            </tr>
          </TableHeader>
          <TableBody>
            {rows.map(row => (
              <TimesheetRow
                key={row.id}
                dates={weekDays}
                selectedClientId={row.clientId}
                selectedProjectId={row.projectId}
                selectedRoleId={row.roleId}
                hours={row.hours}
                onClientChange={(clientId) => setWeekRows(prev => ({
                  ...prev,
                  [weekKey]: prev[weekKey].map(r =>
                    r.id === row.id ? { ...r, clientId, projectId: '', roleId: '' } : r
                  )
                }))}
                onProjectChange={(projectId) => setWeekRows(prev => ({
                  ...prev,
                  [weekKey]: prev[weekKey].map(r =>
                    r.id === row.id ? { ...r, projectId, roleId: '' } : r
                  )
                }))}
                onRoleChange={(roleId) => setWeekRows(prev => ({
                  ...prev,
                  [weekKey]: prev[weekKey].map(r =>
                    r.id === row.id ? { ...r, roleId } : r
                  )
                }))}
                onHoursChange={(date, hours) => handleHoursChange(row.id, date, hours)}
                onRemove={() => handleRemoveRow(row.id)}
                editingCell={editingCell}
                onStartEdit={setEditingCell}
                onEndEdit={() => setEditingCell(null)}
              />
            ))}
          </TableBody>
        </Table>
      </div>
      <div className="p-4 border-t space-y-4">
        <div className="flex justify-between items-center">
          {isCurrentWeek && (
            <Button
              variant="secondary"
              onClick={handleCopyPreviousWeek}
              className="flex items-center gap-2"
            >
              <Copy className="h-4 w-4" />
              Copy Previous Week
            </Button>
          )}
          <div className={`text-sm ${!isCurrentWeek ? 'ml-auto' : ''}`}>
            <span className="font-medium text-gray-700">Weekly Total:</span>
            <span className="ml-2 font-semibold text-gray-900">{weeklyTotal.toFixed(2)} hours</span>
          </div>
        </div>
        <Button
          variant="secondary"
          onClick={handleAddRow}
          className="w-full"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Row
        </Button>
      </div>
    </Card>
  );
}