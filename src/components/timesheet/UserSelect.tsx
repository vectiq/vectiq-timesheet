import { Select } from '@/components/ui/Select';
import { User } from '@/types';

interface UserSelectProps {
  users: User[];
  selectedUserId: string | null;
  onChange: (userId: string) => void;
}

export function UserSelect({ users, selectedUserId, onChange }: UserSelectProps) {
  return (
    <div className="flex items-center gap-2">
      <label htmlFor="user-select" className="text-sm font-medium text-gray-700">
        View Timesheet For:
      </label>
      <select
        id="user-select"
        value={selectedUserId || ''}
        onChange={(e) => onChange(e.target.value)}
        className="block rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-sm"
      >
        {users.map((user) => (
          <option key={user.id} value={user.id}>
            {user.name}
          </option>
        ))}
      </select>
    </div>
  );
}