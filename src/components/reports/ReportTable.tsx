import { useState, useMemo } from 'react';
import { Table, TableHeader, TableBody, Th, Td } from '@/components/ui/Table'; 
import { formatCurrency } from '@/lib/utils/currency';
import { formatDate } from '@/lib/utils/date';
import type { ReportEntry } from '@/types';
import { Badge } from '@/components/ui/Badge';
import { format, parseISO, isAfter, isBefore, isEqual } from 'date-fns';
import { ChevronUp, ChevronDown } from 'lucide-react';

type SortField = keyof ReportEntry;
type SortDirection = 'asc' | 'desc';

interface ReportTableProps {
  data?: ReportEntry[];
  approvals?: any[];
}

function getSortedData(data: ReportEntry[], field: SortField, direction: SortDirection) {
  return [...data].sort((a, b) => {
    let comparison = 0;
    
    // Handle different field types
    if (field === 'date') {
      const dateA = parseISO(a[field]);
      const dateB = parseISO(b[field]);
      comparison = isAfter(dateA, dateB) ? 1 : isEqual(dateA, dateB) ? 0 : -1;
    } else if (typeof a[field] === 'number') {
      comparison = (a[field] as number) - (b[field] as number);
    } else {
      comparison = String(a[field]).localeCompare(String(b[field]));
    }
    
    return direction === 'asc' ? comparison : -comparison;
  });
}

export function ReportTable({ data, approvals = [] }: ReportTableProps) {
  if (!data?.length) {
    return (
      <div className="text-center py-12 text-gray-500">
        No data available for the selected filters
      </div>
    );
  }
  const [sortField, setSortField] = useState<SortField>('date');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  const [filters, setFilters] = useState<Partial<Record<keyof ReportEntry, string>>>({});

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const handleFilterChange = (field: keyof ReportEntry, value: string) => {
    setFilters(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const filteredAndSortedData = useMemo(() => {
    if (!data?.length) return [];

    // Apply filters
    let filtered = data.filter(entry => {
      return Object.entries(filters).every(([field, value]) => {
        if (!value) return true;
        const fieldValue = String(entry[field as keyof ReportEntry]).toLowerCase();
        return fieldValue.includes(value.toLowerCase());
      });
    });

    // Apply sorting
    return getSortedData(filtered, sortField, sortDirection);
  }, [data, filters, sortField, sortDirection]);

  return (
    <div className="bg-white shadow-sm ring-1 ring-gray-900/5 rounded-lg">
      <Table>
        <TableHeader>
          <tr className="border-b border-gray-200">
            {[
              { key: 'date', label: 'Date' },
              { key: 'userName', label: 'User' },
              { key: 'clientName', label: 'Client' },
              { key: 'projectName', label: 'Project' },
              { key: 'taskName', label: 'Task' },
              { key: 'approvalStatus', label: 'Approval Status' },
              { key: 'hours', label: 'Hours' },
              { key: 'cost', label: 'Cost' },
              { key: 'revenue', label: 'Revenue' },
              { key: 'profit', label: 'Profit' }
            ].map(({ key, label }) => (
              <Th key={key}>
                <div className="space-y-2">
                  <button
                    onClick={() => handleSort(key as SortField)}
                    className="flex items-center gap-1 hover:text-indigo-600"
                  >
                    {label}
                    {sortField === key && (
                      sortDirection === 'asc' ? 
                        <ChevronUp className="h-4 w-4" /> : 
                        <ChevronDown className="h-4 w-4" />
                    )}
                  </button>
                  <input
                    type="text"
                    placeholder={`Filter ${label}`}
                    className="w-full px-2 py-1 text-sm border rounded"
                    onChange={(e) => handleFilterChange(key as keyof ReportEntry, e.target.value)}
                    value={filters[key as keyof ReportEntry] || ''}
                  />
                </div>
              </Th>
            ))}
          </tr>
        </TableHeader>
        <TableBody>
          {filteredAndSortedData.map((entry) => (
            <tr key={entry.id}>
              <Td>{formatDate(entry.date)}</Td>
              <Td>{entry.userName}</Td>
              <Td>{entry.clientName}</Td>
              <Td>{entry.projectName}</Td>
              <Td>{entry.taskName}</Td>
              <Td>
                <Badge
                  variant={
                    entry.approvalStatus === 'Approval Not Required' ? 'secondary' :
                    entry.approvalStatus === 'approved' ? 'success' :
                    entry.approvalStatus === 'pending' ? 'warning' :
                    entry.approvalStatus === 'rejected' ? 'destructive' :
                    'default'
                  }
                >
                  {entry.approvalStatus}
                </Badge>
              </Td>
              <Td>{entry.hours}</Td>
              <Td>{formatCurrency(entry.cost)}</Td>
              <Td>{formatCurrency(entry.revenue)}</Td>
              <Td>{formatCurrency(entry.profit)}</Td>
            </tr>
          ))}
        </TableBody>
      </Table>
      
      {/* Debug Box */}
      <div className="mt-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
        <h3 className="text-sm font-medium text-gray-900 mb-2">Debug: Approval Records</h3>
        <div className="space-y-2">
          {approvals.map(approval => (
            <div key={approval.id} className="text-sm">
              <div className="font-medium">{approval.project?.name}</div>
              <div className="text-gray-500">
                Status: {approval.status} • Period: {format(parseISO(approval.startDate), 'MMM d')} - {format(parseISO(approval.endDate), 'MMM d')}
              </div>
            </div>
          ))}
          {approvals.length === 0 && (
            <div className="text-sm text-gray-500">No approval records found for this period</div>
          )}
        </div>
      </div>
    </div>
  );
}