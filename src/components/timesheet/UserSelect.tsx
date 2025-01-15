import { User as UserIcon } from 'lucide-react';
import { auth } from '@/lib/firebase';
import { Select, SelectTrigger, SelectContent, SelectItem } from '@/components/ui/Select';
import { User } from '@/types';
import { useMemo } from 'react';

interface UserSelectProps {
  users: User[];
  selectedUserId: string;
  onChange: (userId: string) => void;
}

export function UserSelect({ users, selectedUserId, onChange }: UserSelectProps) {
  const selectedUser = users.find(user => user.id === selectedUserId);
  const currentUserId = auth.currentUser?.uid;
  
  // Sort users with current user first, then alphabetically
  const sortedUsers = useMemo(() => {
    return [...users].sort((a, b) => {
      // Current user always comes first
      if (a.id === currentUserId) return -1;
      if (b.id === currentUserId) return 1;
      
      // Otherwise sort alphabetically by name
      return a.name.localeCompare(b.name);
    });
  }, [users, currentUserId]);

  return (
    <Select value={selectedUserId} onValueChange={onChange}>
      <SelectTrigger className="min-w-[200px] bg-white">
        <div className="flex items-center gap-2">
          <UserIcon className="h-4 w-4 text-gray-500" />
          <span>{selectedUser?.name}</span>
          {selectedUser?.id === currentUserId && (
            <span className="ml-auto text-xs bg-indigo-50 text-indigo-700 px-1.5 py-0.5 rounded-md font-medium">
              Me
            </span>
          )}
        </div>
      </SelectTrigger>
      <SelectContent>
        {sortedUsers.map(user => (
          <SelectItem 
            key={user.id} 
            value={user.id}
            className="flex items-center justify-between"
          >
            <span>{user.name}</span>
            {user.id === currentUserId && (
              <span className="ml-2 text-xs bg-indigo-50 text-indigo-700 px-1.5 py-0.5 rounded-md font-medium">
                Me
              </span>
            )}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}