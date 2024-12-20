import { useCallback } from 'react';
import { useClients } from './useClients';
import { useProjects } from './useProjects';
import { useRoles } from './useRoles';
import { getClientProjects, getProjectRoles, getProjectRole } from '@/lib/store/selectors';

export function useTimesheetData() {
  const { clients } = useClients();
  const { projects } = useProjects();
  const { roles } = useRoles();

  const sortedClients = clients.slice().sort((a, b) => a.name.localeCompare(b.name));

  const getProjectsForClient = useCallback((clientId: string) => 
    getClientProjects(projects, clientId),
    [projects]
  );

  const getRolesForProject = useCallback((projectId: string) => {
    const project = projects.find(p => p.id === projectId);
    return getProjectRoles(roles, project);
  }, [projects, roles]);

  const getProjectRoleDetails = useCallback((projectId: string, roleId: string) => {
    const project = projects.find(p => p.id === projectId);
    return getProjectRole(roles, project, roleId);
  }, [projects, roles]);

  return {
    clients: sortedClients,
    getProjectsForClient,
    getRolesForProject,
    getProjectRoleDetails,
  };
}