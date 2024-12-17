import { format } from 'date-fns';
import { Member } from '@/types';
import { Badge } from '@/components/ui/Badge';

interface MembersTableProps {
  members: Member[];
}

export function MembersTable({ members }: MembersTableProps) {
  return (
    <div className="bg-white shadow-sm ring-1 ring-gray-900/5 rounded-lg">
      <table className="min-w-full divide-y divide-gray-300">
        <thead>
          <tr>
            <th className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900">Name</th>
            <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Email</th>
            <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Role</th>
            <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Status</th>
            <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Joined</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {members.map((member) => (
            <tr key={member.id}>
              <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900">
                {member.name}
              </td>
              <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{member.email}</td>
              <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                <Badge variant={member.role === 'admin' ? 'default' : 'secondary'}>
                  {member.role}
                </Badge>
              </td>
              <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                <Badge
                  variant={member.status === 'active' ? 'success' : 'warning'}
                >
                  {member.status}
                </Badge>
              </td>
              <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                {member.joinedAt ? format(new Date(member.joinedAt), 'MMM d, yyyy') : '-'}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}