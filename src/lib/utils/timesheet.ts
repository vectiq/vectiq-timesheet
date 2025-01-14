import { format } from 'date-fns';
import type { TimeEntry } from '@/types';

interface GroupedEntry {
  date: string;
  tasks: {
    [taskId: string]: {
      hours: number;
      taskName: string;
    };
  };
}

export function formatTimesheetBreakdown(
  entries: TimeEntry[],
  tasks: { id: string; name: string }[]
): string {
  // Group entries by date
  const groupedEntries = entries.reduce<Record<string, GroupedEntry>>((acc, entry) => {
    if (!acc[entry.date]) {
      acc[entry.date] = {
        date: entry.date,
        tasks: {},
      };
    }
    
    if (!acc[entry.date].tasks[entry.taskId]) {
      const task = tasks.find(r => r.id === entry.taskId);
      acc[entry.date].tasks[entry.taskId] = {
        hours: 0,
        taskName: task?.name || 'Unknown Task',
      };
    }
    
    acc[entry.date].tasks[entry.taskId].hours += entry.hours;
    return acc;
  }, {});

  // Sort dates
  const sortedDates = Object.values(groupedEntries).sort((a, b) => 
    a.date.localeCompare(b.date)
  );

  // Generate HTML table
  const tableRows = sortedDates.map(day => {
    const date = format(new Date(day.date), 'EEE, MMM d');
    const taskColumns = Object.entries(day.tasks)
      .map(([_, data]) => 
        `<td style="padding: 8px; border: 1px solid #e5e7eb; text-align: right;">
          ${data.hours.toFixed(2)} (${data.taskName})
        </td>`
      )
      .join('');
    
    const totalHours = Object.values(day.tasks)
      .reduce((sum, data) => sum + data.hours, 0);

    return `
      <tr>
        <td style="padding: 8px; border: 1px solid #e5e7eb;">${date}</td>
        ${taskColumns}
        <td style="padding: 8px; border: 1px solid #e5e7eb; text-align: right; font-weight: 500;">
          ${totalHours.toFixed(2)}
        </td>
      </tr>
    `;
  });

  // Calculate task totals
  const taskTotals = sortedDates.reduce((totals, day) => {
    Object.entries(day.tasks).forEach(([taskId, data]) => {
      if (!totals[taskId]) {
        totals[taskId] = {
          hours: 0,
          taskName: data.taskName,
        };
      }
      totals[taskId].hours += data.hours;
    });
    return totals;
  }, {} as Record<string, { hours: number; taskName: string }>);

  const totalRow = `
    <tr style="font-weight: 600; background-color: #f9fafb;">
      <td style="padding: 8px; border: 1px solid #e5e7eb;">Total</td>
      ${Object.values(taskTotals)
        .map(data => 
          `<td style="padding: 8px; border: 1px solid #e5e7eb; text-align: right;">
            ${data.hours.toFixed(2)} (${data.taskName})
          </td>`
        )
        .join('')}
      <td style="padding: 8px; border: 1px solid #e5e7eb; text-align: right;">
        ${Object.values(taskTotals)
          .reduce((sum, data) => sum + data.hours, 0)
          .toFixed(2)}
      </td>
    </tr>
  `;

  return `
    <table style="width: 100%; border-collapse: collapse; margin: 20px 0; font-size: 14px;">
      <thead style="background-color: #f3f4f6;">
        <tr>
          <th style="padding: 8px; border: 1px solid #e5e7eb; text-align: left;">Date</th>
          ${Object.values(taskTotals)
            .map(data => 
              `<th style="padding: 8px; border: 1px solid #e5e7eb; text-align: right;">
                ${data.taskName}
              </th>`
            )
            .join('')}
          <th style="padding: 8px; border: 1px solid #e5e7eb; text-align: right;">Total</th>
        </tr>
      </thead>
      <tbody>
        ${tableRows.join('')}
        ${totalRow}
      </tbody>
    </table>
  `;
}