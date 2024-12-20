import { StateCreator } from 'zustand';
import type { Project } from '@/types';

export interface ProjectsSlice {
  projects: Project[];
  setProjects: (projects: Project[]) => void;
  addProject: (project: Project) => void;
  updateProject: (id: string, project: Partial<Project>) => void;
  deleteProject: (id: string) => void;
}

export const createProjectsSlice: StateCreator<ProjectsSlice> = (set, get, store, initialProjects: Project[] = []) => ({
  projects: initialProjects,
  setProjects: (projects) => set({ projects }),
  addProject: (project) => set((state) => ({ projects: [...state.projects, project] })),
  updateProject: (id, project) => set((state) => ({
    projects: state.projects.map(p => p.id === id ? { ...p, ...project } : p)
  })),
  deleteProject: (id) => set((state) => ({
    projects: state.projects.filter(p => p.id !== id)
  })),
});