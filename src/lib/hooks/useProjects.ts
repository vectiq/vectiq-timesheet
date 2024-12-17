import { useQuery } from '@tanstack/react-query';
import { fetchProjects } from '@/lib/api/projects';

export function useProjects() {
  const query = useQuery({
    queryKey: ['projects'],
    queryFn: fetchProjects,
  });

  return {
    projects: query.data ?? [],
    isLoading: query.isLoading,
    error: query.error,
  };
}