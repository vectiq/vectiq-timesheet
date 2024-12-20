import { useQuery, useMutation } from '@tanstack/react-query';
import { useStore } from '@/lib/store';
import type { Project } from '@/types';

export function useProjects() {
  const store = useStore();

  const query = useQuery({
    queryKey: ['projects'],
    queryFn: () => store.projects,
    initialData: [],
  });

  const createMutation = useMutation({
    mutationFn: (project: Omit<Project, 'id'>) => {
      const newProject = {
        ...project,
        id: `proj_${Date.now()}`,
      };
      store.addProject(newProject);
      return newProject;
    },
    onSuccess: () => {
      query.refetch();
    },
  });

  const updateMutation = useMutation({
    mutationFn: (project: Project) => {
      store.updateProject(project.id, project);
      return project;
    },
    onSuccess: () => {
      query.refetch();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => {
      store.deleteProject(id);
    },
    onSuccess: () => {
      query.refetch();
    },
  });

  return {
    projects: query.data,
    isLoading: query.isLoading,
    error: query.error,
    createProject: createMutation.mutate,
    updateProject: updateMutation.mutate,
    deleteProject: deleteMutation.mutate,
  };
}