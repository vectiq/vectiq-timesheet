import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
  getSortedRowModel,
} from '@tanstack/react-table';
import { TimeEntry, Project } from '@/types';
import { formatDate } from '@/lib/utils/date';
import { formatCurrency } from '@/lib/utils/currency';

const columnHelper = createColumnHelper<TimeEntry>();

interface Props {
  timeEntries: TimeEntry[];
  projects: Project[];
}

export function TimeEntriesTable({ timeEntries, projects }: Props) {
  const columns = [
    columnHelper.accessor('date', {
      header: 'Date',
      cell: (info) => formatDate(info.getValue()),
    }),
    columnHelper.accessor('projectId', {
      header: 'Project',
      cell: (info) => {
        const project = projects.find(p => p.id === info.getValue());
        return project?.name || 'Unknown Project';
      },
    }),
    columnHelper.accessor('hours', {
      header: 'Hours',
      cell: (info) => info.getValue().toFixed(2),
    }),
    columnHelper.accessor('description', {
      header: 'Description',
      cell: (info) => (
        <div className="max-w-md truncate">{info.getValue()}</div>
      ),
    }),
    columnHelper.accessor('status', {
      header: 'Status',
      cell: (info) => (
        <span
          className={`px-2 py-1 rounded-full text-xs font-medium ${
            info.getValue() === 'approved'
              ? 'bg-green-100 text-green-800'
              : info.getValue() === 'rejected'
              ? 'bg-red-100 text-red-800'
              : 'bg-yellow-100 text-yellow-800'
          }`}
        >
          {info.getValue()}
        </span>
      ),
    }),
  ];

  const table = useReactTable({
    data: timeEntries,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  return (
    <div className="overflow-x-auto ring-1 ring-gray-300 rounded-lg">
      <table className="min-w-full divide-y divide-gray-300">
        <thead className="bg-gray-50">
          {table.getHeaderGroups().map((headerGroup) => (
            <tr key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <th
                  key={header.id}
                  className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                >
                  {flexRender(
                    header.column.columnDef.header,
                    header.getContext()
                  )}
                </th>
              ))}
            </tr>
          ))}
        </thead>
        <tbody className="divide-y divide-gray-200 bg-white">
          {table.getRowModel().rows.map((row) => (
            <tr key={row.id}>
              {row.getVisibleCells().map((cell) => (
                <td
                  key={cell.id}
                  className="whitespace-nowrap px-3 py-4 text-sm text-gray-500"
                >
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}