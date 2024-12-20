import { useQuery, useMutation } from '@tanstack/react-query';
import { useStore } from '@/lib/store';
import type { Role } from '@/types';

export function useRoles() {
  const store = useStore();

  const query = useQuery({
    queryKey: ['roles'],
    queryFn: () => store.roles,
    initialData: [],
  });

  const createMutation = useMutation({
    mutationFn: (role: Omit<Role, 'id'>) => {
      const newRole = {
        ...role,
        id: `role_${Date.now()}`,
      };
      store.addRole(newRole);
      return newRole;
    },
  });

  const updateMutation = useMutation({
    mutationFn: (role: Role) => {
      store.updateRole(role.id, role);
      return role;
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => {
      store.deleteRole(id);
    },
  });

  return {
    roles: query.data,
    isLoading: query.isLoading,
    error: query.error,
    createRole: createMutation.mutate,
    updateRole: updateMutation.mutate,
    deleteRole: deleteMutation.mutate,
  };
}