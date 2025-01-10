import { Edit, Trash2, UserPlus } from 'lucide-react';
import { Table, TableHeader, TableBody, Th, Td } from '@/components/ui/Table';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { formatDate } from '@/lib/utils/date';
import { formatCurrency } from '@/lib/utils/currency';
import { useProjects } from '@/lib/hooks/useProjects';
import { useTasks } from '@/lib/hooks/useTasks';
import { useClients } from '@/lib/hooks/useClients';
import type { User, ProjectAssignment } from '@/types';

interface UsersTableProps {
  users: User[];
  onEdit: (user: User) => void;
  onDelete: (id: string) => void;
  onAssignProject: (user: User) => void;
  onRemoveAssignment: (userId: string, assignmentId: string) => void;
}

export function UsersTable({ 
  users, 
  onEdit, 
  onDelete,
  onAssignProject,
  onRemoveAssignment,
}: UsersTableProps) {
  const { projects } = useProjects();
  const { tasks } = useTasks();
  const { clients } = useClients();

  return (
    <Table>
      <TableHeader>
        <tr>
          <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Name</th>
          <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Email</th>
          <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Hours/Week</th>
          <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Overtime</th>
          <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Role</th>
          <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Project Assignments</th>
          <th scope="col" className="px-3 py-3.5 text-right text-sm font-semibold text-gray-900">Actions</th>
        </tr>
      </TableHeader>
      <TableBody>
        {users.map((user) => {
          const userAssignments = user.projectAssignments || [];

          return (
            <tr key={user.id}>
              <Td className="font-medium text-gray-900">{user.name}</Td>
              <Td>{user.email}</Td>
              <Td>{user.hoursPerWeek}</Td>
              <Td>
                <Badge variant="secondary">
                  {user.overtime === 'no' ? 'No Overtime' : 
                   user.overtime === 'billable' ? 'Billable Only' : 
                   'All Hours'}
                </Badge>
              </Td>
              <Td>
                <Badge variant={user.role === 'admin' ? 'warning' : 'secondary'}>
                  {user.role}
                </Badge>
              </Td>
              <Td>
                <div className="space-y-2">
                  {userAssignments?.map(assignment => {
                    const project = projects.find(p => p.id === assignment.projectId);
                    const client = clients.find(c => c.id === assignment.clientId);
                    const projectTask = project?.tasks?.find(r => r.id === assignment.taskId);
                    
                    if (!project || !projectTask || !client) return null;
                    
                    return (
                      <div key={assignment.id} className="flex items-center justify-between text-sm py-1">
                        <div className="flex-1 flex items-center gap-2">
                          <span className="text-gray-500 truncate">{client.name}</span>
                          <span className="text-gray-400 shrink-0">-</span>
                          <span className="font-gray-500 truncate">{project.name}</span>
                          <span className="text-gray-400 shrink-0">-</span>
                          <span className="text-gray-500 truncate">{projectTask?.name}</span>
                        </div>
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => onRemoveAssignment(user.id, assignment.id)}
                          className="ml-2 shrink-0"
                        >
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      </div>
                    );
                  })}
                  {userAssignments.length === 0 && (
                    <div className="text-sm text-gray-500">
                      No project assignments
                    </div>
                  )}
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