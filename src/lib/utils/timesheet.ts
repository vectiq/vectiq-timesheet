import { format } from 'date-fns';
import type { TimeEntry } from '@/types';

interface GroupedEntry {
  date: string;
  roles: {
    [roleId: string]: {
      hours: number;
      roleName: string;
    };
  };
}

export function formatTimesheetBreakdown(
  entries: TimeEntry[],
  roles: { id: string; name: string }[]
): string {
  // Group entries by date
  const groupedEntries = entries.reduce<Record<string, GroupedEntry>>((acc, entry) => {
    if (!acc[entry.date]) {
      acc[entry.date] = {
        date: entry.date,
        roles: {},
      };
    }
    
    if (!acc[entry.date].roles[entry.roleId]) {
      const role = roles.find(r => r.id === entry.roleId);
      acc[entry.date].roles[entry.roleId] = {
        hours: 0,
        roleName: role?.name || 'Unknown Role',
      };
    }
    
    acc[entry.date].roles[entry.roleId].hours += entry.hours;
    return acc;
  }, {});

  // Sort dates
  const sortedDates = Object.values(groupedEntries).sort((a, b) => 
    a.date.localeCompare(b.date)
  );

  // Generate HTML table
  const tableRows = sortedDates.map(day => {
    const date = format(new Date(day.date), 'EEE, MMM d');
    const roleColumns = Object.entries(day.roles)
      .map(([_, data]) => 
        `<td style="padding: 8px; border: 1px solid #e5e7eb; text-align: right;">
          ${data.hours.toFixed(2)} (${data.roleName})
        </td>`
      )
      .join('');
    
    const totalHours = Object.values(day.roles)
      .reduce((sum, data) => sum + data.hours, 0);

    return `
      <tr>
        <td style="padding: 8px; border: 1px solid #e5e7eb;">${date}</td>
        ${roleColumns}
        <td style="padding: 8px; border: 1px solid #e5e7eb; text-align: right; font-weight: 500;">
          ${totalHours.toFixed(2)}
        </td>
      </tr>
    `;
  });

  // Calculate role totals
  const roleTotals = sortedDates.reduce((totals, day) => {
    Object.entries(day.roles).forEach(([roleId, data]) => {
      if (!totals[roleId]) {
        totals[roleId] = {
          hours: 0,
          roleName: data.roleName,
        };
      }
      totals[roleId].hours += data.hours;
    });
    return totals;
  }, {} as Record<string, { hours: number; roleName: string }>);

  const totalRow = `
    <tr style="font-weight: 600; background-color: #f9fafb;">
      <td style="padding: 8px; border: 1px solid #e5e7eb;">Total</td>
      ${Object.values(roleTotals)
        .map(data => 
          `<td style="padding: 8px; border: 1px solid #e5e7eb; text-align: right;">
            ${data.hours.toFixed(2)} (${data.roleName})
          </td>`
        )
        .join('')}
      <td style="padding: 8px; border: 1px solid #e5e7eb; text-align: right;">
        ${Object.values(roleTotals)
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
          ${Object.values(roleTotals)
            .map(data => 
              `<th style="padding: 8px; border: 1px solid #e5e7eb; text-align: right;">
                ${data.roleName}
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