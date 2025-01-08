import { Edit, Trash2 } from 'lucide-react';
import { Table, TableHeader, TableBody, Th, Td } from '@/components/ui/Table';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { formatDate } from '@/lib/utils/date';

interface LeaveTableProps {
  onEdit: (leave: any) => void;
  onDelete: (id: string) => void;
}

export function LeaveTable({ onEdit, onDelete }: LeaveTableProps) {
  // TODO: Replace with actual leave data from Xero
  const leaves = [];

  return (
    <Table>
      <TableHeader>
        <tr>
          <Th>Start Date</Th>
          <Th>End Date</Th>
          <Th>Type</Th>
          <Th>Status</Th>
          <Th>Description</Th>
          <Th className="text-right">Actions</Th>
        </tr>
      </TableHeader>
      <TableBody>
        {leaves.map((leave) => (
          <tr key={leave.id}>
            <Td>{formatDate(leave.startDate)}</Td>
            <Td>{formatDate(leave.endDate)}</Td>
            <Td>{leave.type}</Td>
            <Td>
              <Badge
                variant={
                  leave.status === 'APPROVED'
                    ? 'success'
                    : leave.status === 'PENDING'
                    ? 'warning'
                    : 'destructive'
                }
              >
                {leave.status}
              </Badge>
            </Td>
            <Td>{leave.description}</Td>
            <Td className="text-right">
              <div className="flex justify-end gap-2">
                <Button variant="secondary" size="sm" onClick={() => onEdit(leave)}>
                  <Edit className="h-4 w-4" />
                </Button>
                <Button variant="secondary" size="sm" onClick={() => onDelete(leave.id)}>
                  <Trash2 className="h-4 w-4 text-red-500" />
                </Button>
              </div>
            </Td>
          </tr>
        ))}
        {leaves.length === 0 && (
          <tr>
            <td colSpan={6} className="text-center py-4 text-gray-500">
              No leave requests found
            </td>
          </tr>
        )}
      </TableBody>
    </Table>
  );
}