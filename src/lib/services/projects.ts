import { mockProjects } from './mockData';
import type { Project } from '@/types';

export async function getProjects(): Promise<Project[]> {
  await new Promise(resolve => setTimeout(resolve, 500));
  return mockProjects;
}

export async function createProject(project: Omit<Project, 'id'>): Promise<Project> {
  await new Promise(resolve => setTimeout(resolve, 500));
  const newProject = {
    ...project,
    id: `proj_${Date.now()}`,
  };
  mockProjects.push(newProject);
  return newProject;
}

export async function updateProject(id: string, project: Partial<Project>): Promise<Project> {
  await new Promise(resolve => setTimeout(resolve, 500));
  const index = mockProjects.findIndex(p => p.id === id);
  if (index === -1) throw new Error('Project not found');
  
  mockProjects[index] = {
    ...mockProjects[index],
    ...project,
  };
  return mockProjects[index];
}

export async function deleteProject(id: string): Promise<void> {
  await new Promise(resolve => setTimeout(resolve, 500));
  const index = mockProjects.findIndex(p => p.id === id);
  if (index === -1) throw new Error('Project not found');
  mockProjects.splice(index, 1);
}