import { StateCreator } from 'zustand';
import type { Project } from '@/types';

export interface ProjectsSlice {
  projects: Project[];
  setProjects: (projects: Project[]) => void;
}

export const createProjectsSlice: StateCreator<ProjectsSlice> = (set) => ({
  projects: [],
  setProjects: (projects) => set({ projects }),
});