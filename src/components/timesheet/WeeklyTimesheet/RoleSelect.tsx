import { ProjectRole } from '@/types';

interface RoleSelectProps {
  roles: ProjectRole[];
  value: string;
  onChange: (value: string) => void;
}

export function RoleSelect({ roles, value, onChange }: RoleSelectProps) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-sm"
    >
      <option value="">Select Role</option>
      {roles.map((role) => (
        <option key={role.id} value={role.id}>
          {role.name}
        </option>
      ))}
    </select>
  );
}