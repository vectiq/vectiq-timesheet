import { useMemo } from 'react';
import { Card } from '@/components/ui/Card';
import { Table, TableHeader, TableBody, Th, Td } from '@/components/ui/Table';
import { useTimeEntries } from '@/lib/hooks/useTimeEntries';
import { useFilteredTimeEntries } from '@/lib/hooks/useFilteredTimeEntries';
import { useClients } from '@/lib/hooks/useClients';
import { formatDate } from '@/lib/utils/date';
import { formatCurrency } from '@/lib/utils/currency';
import type { Project, TimeEntry } from '@/types';

interface MonthlyViewProps {
  projects: Project[];
  dateRange: {
    start: Date;
    end: Date;
  };
}

interface GroupedEntry {
  clientId: string;
  clientName: string;
  entries: Array<{
    id: string;
    date: string;
    projectName: string;
    roleName: string;
    hours: number;
    cost: number;
    revenue: number;
  }>;
  totalHours: number;
  totalCost: number;
  totalRevenue: number;
}

export function MonthlyView({ projects, dateRange }: MonthlyViewProps) {
  const entries = useFilteredTimeEntries({
    timeEntries: useTimeEntries().timeEntries,
    dateRange
  });
  const { clients } = useClients();

  // Create lookup maps for better performance
  const projectMap = useMemo(() => 
    new Map(projects.map(p => [p.id, p])),
    [projects]
  );

  const clientMap = useMemo(() => 
    new Map(clients.map(c => [c.id, c])),
    [clients]
  );

  // Group entries by client
  const groupedEntries = useMemo(() => {
    const groups = new Map<string, GroupedEntry>();

    entries.forEach(entry => {
      const project = projectMap.get(entry.projectId);
      if (!project) return;

      const client = clientMap.get(project.clientId);
      if (!client) return;

      const role = project.roles.find(r => r.roleId === entry.roleId);
      if (!role) return;

      const cost = entry.hours * (role.costRate || 0);
      const revenue = entry.hours * (role.sellRate || 0);

      if (!groups.has(project.clientId)) {
        groups.set(project.clientId, {
          clientId: project.clientId,
          clientName: client.name,
          entries: [],
          totalHours: 0,
          totalCost: 0,
          totalRevenue: 0,
        });
      }

      const group = groups.get(project.clientId)!;
      group.entries.push({
        id: entry.id,
        date: entry.date,
        projectName: project.name,
        roleName: role.roleId,
        hours: entry.hours,
        cost,
        revenue,
      });
      group.totalHours += entry.hours;
      group.totalCost += cost;
      group.totalRevenue += revenue;
    });

    return Array.from(groups.values()).sort((a, b) => 
      b.totalHours - a.totalHours
    );
  }, [entries, projectMap, clientMap]);

  const totals = useMemo(() => ({
    hours: groupedEntries.reduce((sum, group) => sum + group.totalHours, 0),
    cost: groupedEntries.reduce((sum, group) => sum + group.totalCost, 0),
    revenue: groupedEntries.reduce((sum, group) => sum + group.totalRevenue, 0),
  }), [groupedEntries]);

  return (
    <div className="space-y-6">
      {/* Summary Card */}
      <Card className="p-4">
        <div className="grid grid-cols-3 gap-4">
          <div>
            <div className="text-sm font-medium text-gray-500">Total Hours</div>
            <div className="mt-1 text-2xl font-semibold">{totals.hours.toFixed(2)}</div>
          </div>
          <div>
            <div className="text-sm font-medium text-gray-500">Total Cost</div>
            <div className="mt-1 text-2xl font-semibold">{formatCurrency(totals.cost)}</div>
          </div>
          <div>
            <div className="text-sm font-medium text-gray-500">Total Revenue</div>
            <div className="mt-1 text-2xl font-semibold">{formatCurrency(totals.revenue)}</div>
          </div>
        </div>
      </Card>

      {/* Entries by Client */}
      {groupedEntries.map(group => (
        <Card key={group.clientId} className="overflow-hidden">
          <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-medium text-gray-900">
                {group.clientName}
              </h3>
              <div className="text-sm text-gray-500">
                {group.totalHours.toFixed(2)} hours
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <tr className="border-b border-gray-200">
                  <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Date</th>
                  <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Project</th>
                  <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Role</th>
                  <th scope="col" className="px-3 py-3.5 text-right text-sm font-semibold text-gray-900">Hours</th>
                  <th scope="col" className="px-3 py-3.5 text-right text-sm font-semibold text-gray-900">Cost</th>
                  <th scope="col" className="px-3 py-3.5 text-right text-sm font-semibold text-gray-900">Revenue</th>
                </tr>
              </TableHeader>
              <TableBody>
                {group.entries.map(entry => (
                  <tr key={entry.id}>
                    <Td>{formatDate(entry.date)}</Td>
                    <Td>{entry.projectName}</Td>
                    <Td>{entry.roleName}</Td>
                    <Td className="text-right">{entry.hours.toFixed(2)}</Td>
                    <Td className="text-right">{formatCurrency(entry.cost)}</Td>
                    <Td className="text-right">{formatCurrency(entry.revenue)}</Td>
                  </tr>
                ))}
                <tr className="bg-gray-50 font-medium">
                  <Td colSpan={3}>Total</Td>
                  <Td className="text-right">{group.totalHours.toFixed(2)}</Td>
                  <Td className="text-right">{formatCurrency(group.totalCost)}</Td>
                  <Td className="text-right">{formatCurrency(group.totalRevenue)}</Td>
                </tr>
              </TableBody>
            </Table>
          </div>
        </Card>
      ))}

      {groupedEntries.length === 0 && (
        <Card className="p-8 text-center text-gray-500">
          No time entries found for this period
        </Card>
      )}
    </div>
  );
}