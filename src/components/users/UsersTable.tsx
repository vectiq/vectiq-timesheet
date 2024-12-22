import { Edit, Trash2, UserPlus } from 'lucide-react';
import { Table, TableHeader, TableBody, Th, Td } from '@/components/ui/Table';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { formatDate } from '@/lib/utils/date';
import { useProjects } from '@/lib/hooks/useProjects';
import { useRoles } from '@/lib/hooks/useRoles';
import { useClients } from '@/lib/hooks/useClients';
import type { User, ProjectAssignment } from '@/types';

interface UsersTableProps {
  users: User[];
  assignments: ProjectAssignment[];
  onEdit: (user: User) => void;
  onDelete: (id: string) => void;
  onAssignProject: (user: User) => void;
  onRemoveAssignment: (assignmentId: string) => void;
}

export function UsersTable({ 
  users, 
  assignments,
  onEdit, 
  onDelete,
  onAssignProject,
  onRemoveAssignment,
}: UsersTableProps) {
  const { projects } = useProjects();
  const { roles } = useRoles();
  const { clients } = useClients();

  return (
    <Table>
      <TableHeader>
        <tr className="border-b border-gray-200">
          <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Name</th>
          <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Email</th>
          <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Role</th>
          <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Status</th>
          <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Project Assignments</th>
          <th scope="col" className="px-3 py-3.5 text-right text-sm font-semibold text-gray-900">Actions</th>
        </tr>
      </TableHeader>
      <TableBody>
        {users.map((user) => {
          const userAssignments = assignments.filter(a => a.userId === user.id);

          return (
            <tr key={user.id}>
              <Td className="font-medium text-gray-900">{user.name}</Td>
              <Td>{user.email}</Td>
              <Td>
                <Badge variant={user.role === 'admin' ? 'warning' : 'secondary'}>
                  {user.role}
                </Badge>
              </Td>
              <Td>
                <Badge variant={user.isActive ? 'success' : 'secondary'}>
                  {user.isActive ? 'Active' : 'Inactive'}
                </Badge>
              </Td>
              <Td>
                <div className="space-y-2">
                  {userAssignments.map(assignment => {
                    const project = projects.find(p => p.id === assignment.projectId);
                    const role = roles.find(r => r.id === assignment.roleId);
                    const client = clients.find(c => c.id === assignment.clientId);
                    
                    return (
                      <div key={assignment.id} className="flex items-center justify-between text-sm">
                        <div>
                          <div className="text-gray-500">{client?.name}</div>
                          <div className="font-medium">{project?.name}</div>
                          <div className="text-gray-500">{role?.name}</div>
                        </div>
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => onRemoveAssignment(assignment.id)}
                        >
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      </div>
                    );
                  })}
                </div>
              </Td>
              <Td className="text-right">
                <div className="flex justify-end gap-2">
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => onAssignProject(user)}
                  >
                    <UserPlus className="h-4 w-4" />
                  </Button>
                  <Button variant="secondary" size="sm" onClick={() => onEdit(user)}>
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button variant="secondary" size="sm" onClick={() => onDelete(user.id)}>
                    <Trash2 className="h-4 w-4 text-red-500" />
                  </Button>
                </div>
              </Td>
            </tr>
          );
        })}
      </TableBody>
    </Table>
  );
}