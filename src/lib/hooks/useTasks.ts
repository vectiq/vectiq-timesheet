import { useQuery } from '@tanstack/react-query';
import { useCallback } from 'react';
import { useProjects } from './useProjects';
import type { Task } from '@/types';

export function useTasks() {
  const { projects } = useProjects();

  // Extract all tasks from projects
  const tasks = projects.flatMap(project => 
    project.tasks.map(task => ({
      ...task,
      projectId: project.id
    }))
  );


  return {
    tasks,
    isLoading: false,
  };
}