import { ChevronDown } from 'lucide-react';
import { auth } from '@/lib/firebase';
import { User } from '@/types';

interface UserSelectProps {
  users: User[];
  selectedUserId: string | null;
  onChange: (userId: string) => void;
}

export function UserSelect({ users, selectedUserId, onChange }: UserSelectProps) {
  const selectedUser = users.find(user => user.id === selectedUserId);
  const currentUserId = auth.currentUser?.uid;

  return (
    <div className="relative">
      <button
        type="button"
        className="inline-flex items-center gap-x-1.5 rounded-md bg-white px-3 py-2 text-sm font-medium text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
        onClick={() => {
          const select = document.getElementById('user-select') as HTMLSelectElement;
          select?.click();
        }}
      >
        {selectedUser?.name}
        {selectedUser?.id === currentUserId && (
          <span className="ml-2 text-xs bg-indigo-50 text-indigo-700 px-1.5 py-0.5 rounded-md font-medium">Me</span>
        )}
        <ChevronDown className="-mr-1 h-4 w-4 text-gray-400" aria-hidden="true" />
      </button>
      <select
        id="user-select"
        value={selectedUserId || ''}
        onChange={(e) => onChange(e.target.value)}
        className="absolute left-0 top-0 h-full w-full opacity-0 cursor-pointer"
      >
        {users.map((user) => (
          <option key={user.id} value={user.id}>
            {user.name}{user.id === currentUserId ? ' (Me)' : ''}
          </option>
        ))}
      </select>
    </div>
  );
}