import { useQuery, useMutation } from '@tanstack/react-query';
import { useStore } from '@/lib/store';
import type { User, ProjectAssignment } from '@/types';

export function useUsers() {
  const store = useStore();

  const query = useQuery({
    queryKey: ['users'],
    queryFn: () => store.users,
    initialData: [],
  });

  const assignmentsQuery = useQuery({
    queryKey: ['projectAssignments'],
    queryFn: () => store.projectAssignments,
    initialData: [],
  });

  const createMutation = useMutation({
    mutationFn: (user: Omit<User, 'id'>) => {
      const newUser = {
        id: `user_${Date.now()}`,
        ...user,
      };
      store.addUser(newUser);
      return newUser;
    },
    onSuccess: () => {
      query.refetch();
    },
  });

  const updateMutation = useMutation({
    mutationFn: (user: User) => {
      store.updateUser(user.id, user);
      return user;
    },
    onSuccess: () => {
      query.refetch();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => {
      store.deleteUser(id);
    },
    onSuccess: () => {
      query.refetch();
    },
  });

  const assignToProjectMutation = useMutation({
    mutationFn: (assignment: Omit<ProjectAssignment, 'id'>) => {
      const newAssignment = {
        id: `assignment_${Date.now()}`,
        ...assignment,
      };
      store.addProjectAssignment(newAssignment);
      return newAssignment;
    },
    onSuccess: () => {
      assignmentsQuery.refetch();
    },
  });

  const removeFromProjectMutation = useMutation({
    mutationFn: (assignmentId: string) => {
      store.deleteProjectAssignment(assignmentId);
    },
    onSuccess: () => {
      assignmentsQuery.refetch();
    },
  });

  return {
    users: query.data,
    assignments: assignmentsQuery.data,
    isLoading: query.isLoading || assignmentsQuery.isLoading,
    createUser: createMutation.mutate,
    updateUser: updateMutation.mutate,
    deleteUser: deleteMutation.mutate,
    assignToProject: assignToProjectMutation.mutate,
    removeFromProject: removeFromProjectMutation.mutate,
  };
}