import { Edit, Trash2 } from 'lucide-react';
import { Table, TableHeader, TableBody, Th, Td } from '@/components/ui/Table';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import type { Task } from '@/types';

interface TasksTableProps {
  tasks: Task[];
  onEdit: (task: Task) => void;
  onDelete: (id: string) => void;
}

export function TasksTable({ tasks, onEdit, onDelete }: TasksTableProps) {
  return (
    <Table>
      <TableHeader>
        <tr className="border-b border-gray-200">
          <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Name</th>
          <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Status</th>
          <th scope="col" className="px-3 py-3.5 text-right text-sm font-semibold text-gray-900">Actions</th>
        </tr>
      </TableHeader>
      <TableBody>
        {tasks.map((task) => (
          <tr key={task.id}>
            <Td className="font-medium text-gray-900">{task.name}</Td>
            <Td>
              <Badge variant={task.isActive ? 'success' : 'secondary'}>
                {task.isActive ? 'Active' : 'Inactive'}
              </Badge>
            </Td>
            <Td className="text-right">
              <div className="flex justify-end gap-2">
                <Button variant="secondary" size="sm" onClick={() => onEdit(task)}>
                  <Edit className="h-4 w-4" />
                </Button>
                <Button variant="secondary" size="sm" onClick={() => onDelete(task.id)}>
                  <Trash2 className="h-4 w-4 text-red-500" />
                </Button>
              </div>
            </Td>
          </tr>
        ))}
      </TableBody>
    </Table>
  );
}