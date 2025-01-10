import { Table, TableHeader, TableBody, Th, Td } from '@/components/ui/Table';
import { formatCurrency } from '@/lib/utils/currency';
import { formatDate } from '@/lib/utils/date';
import type { ReportEntry } from '@/types';

interface ReportTableProps {
  data?: ReportEntry[];
}

export function ReportTable({ data }: ReportTableProps) {
  if (!data?.length) {
    return (
      <div className="text-center py-12 text-gray-500">
        No data available for the selected filters
      </div>
    );
  }

  return (
    <div className="bg-white shadow-sm ring-1 ring-gray-900/5 rounded-lg">
      <Table>
        <TableHeader>
          <tr className="border-b border-gray-200">
            <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Date</th>
            <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Client</th>
            <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Project</th>
            <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Task</th>
            <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Hours</th>
            <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Cost</th>
            <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Revenue</th>
            <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Profit</th>
          </tr>
        </TableHeader>
        <TableBody>
          {data.map((entry) => (
            <tr key={entry.id}>
              <Td>{formatDate(entry.date)}</Td>
              <Td>{entry.clientName}</Td>
              <Td>{entry.projectName}</Td>
              <Td>{entry.taskName}</Td>
              <Td>{entry.hours}</Td>
              <Td>{formatCurrency(entry.cost)}</Td>
              <Td>{formatCurrency(entry.revenue)}</Td>
              <Td>{formatCurrency(entry.profit)}</Td>
            </tr>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}