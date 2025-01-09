import { Edit, Trash2, RefreshCw } from 'lucide-react';
import { Table, TableHeader, TableBody, Th, Td } from '@/components/ui/Table';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { formatDate } from '@/lib/utils/date';
import { useLeave } from '@/lib/hooks/useLeave';
import { LoadingScreen } from '@/components/ui/LoadingScreen';
import type { Leave } from '@/types';

interface LeaveTableProps {
  onEdit: (leave: Leave) => void;
  onDelete: (id: string) => void;
}

export function LeaveTable({ onEdit, onDelete }: LeaveTableProps) {
  const { 
    leave,
    isLoading,
    refresh,
    isRefreshing,
    lastRefreshed
  } = useLeave();

  if (isLoading) {
    return <LoadingScreen />;
  }

  const getStatusBadgeVariant = (status: Leave['status']) => {
    switch (status) {
      case 'SCHEDULED':
        return 'success';
      case 'REQUESTED':
        return 'warning';
      case 'REJECTED':
        return 'destructive';
      default:
        return 'secondary';
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div className="text-sm text-gray-500">
          Last updated: {lastRefreshed}
        </div>
        <Button
          variant="secondary"
          size="sm"
          onClick={refresh}
          disabled={isRefreshing}
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
          Refresh from Xero
        </Button>
      </div>

    <Table>
      <TableHeader>
        <tr>
          <Th>Title</Th>
          <Th>Start Date</Th>
          <Th>End Date</Th>
          <Th>Units</Th>
          <Th>Status</Th>
          <Th>Description</Th>
          <Th className="text-right">Actions</Th>
        </tr>
      </TableHeader>
      <TableBody>
        {leave.length > 0 ? (
          leave.map((entry) => (
          <tr key={entry.id}>
            <Td className="font-medium">{entry.title}</Td>
            <Td>{formatDate(entry.startDate)}</Td>
            <Td>{formatDate(entry.endDate)}</Td>
            <Td>{entry.numberOfUnits}</Td>
            <Td>
              <Badge
                variant={getStatusBadgeVariant(entry.status)}
              >
                {entry.status}
              </Badge>
            </Td>
            <Td>{entry.description || '-'}</Td>
            <Td className="text-right">
              <div className="flex justify-end gap-2">
                <Button variant="secondary" size="sm" onClick={() => onEdit(entry)}>
                  <Edit className="h-4 w-4" />
                </Button>
                <Button variant="secondary" size="sm" onClick={() => onDelete(entry.id)}>
                  <Trash2 className="h-4 w-4 text-red-500" />
                </Button>
              </div>
            </Td>
          </tr>))
        ) : (
          <tr>
            <td colSpan={7} className="text-center py-4 text-gray-500">
              No leave requests found
            </td>
          </tr>
        )}
      </TableBody>
    </Table>
    </div>
  );
}