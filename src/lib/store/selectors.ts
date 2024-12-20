import type { Client, Project, Role, ProjectRole } from '@/types';

// Get projects for a specific client
export const getClientProjects = (projects: Project[], clientId: string): Project[] => {
  return projects.filter(project => project.clientId === clientId);
};

// Get roles available for a specific project
export const getProjectRoles = (
  roles: Role[],
  project?: Project
): { role: Role; rates: ProjectRole }[] => {
  if (!project) return [];
  
  return project.roles
    .map(projectRole => {
      const role = roles.find(r => r.id === projectRole.roleId);
      return role ? { role, rates: projectRole } : null;
    })
    .filter(Boolean);
};

// Get a specific project role with rates
export const getProjectRole = (
  roles: Role[],
  project?: Project,
  roleId?: string
): { role: Role; rates: ProjectRole } | null => {
  if (!project || !roleId) return null;

  const projectRole = project.roles.find(pr => pr.roleId === roleId);
  if (!projectRole) return null;

  const role = roles.find(r => r.id === roleId);
  return role ? { role, rates: projectRole } : null;
};