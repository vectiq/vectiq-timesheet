import { Edit, Trash2 } from 'lucide-react';
import { Table, TableHeader, TableBody, Th, Td } from '@/components/ui/Table';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import type { Role } from '@/types';

interface RolesTableProps {
  roles: Role[];
  onEdit: (role: Role) => void;
  onDelete: (id: string) => void;
}

export function RolesTable({ roles, onEdit, onDelete }: RolesTableProps) {
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
        {roles.map((role) => (
          <tr key={role.id}>
            <Td className="font-medium text-gray-900">{role.name}</Td>
            <Td>
              <Badge variant={role.isActive ? 'success' : 'secondary'}>
                {role.isActive ? 'Active' : 'Inactive'}
              </Badge>
            </Td>
            <Td className="text-right">
              <div className="flex justify-end gap-2">
                <Button variant="secondary" size="sm" onClick={() => onEdit(role)}>
                  <Edit className="h-4 w-4" />
                </Button>
                <Button variant="secondary" size="sm" onClick={() => onDelete(role.id)}>
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