import { useMemo } from 'react';
import { useStore } from '@/lib/store';
import { getClientProjects, getProjectRoles, getProjectRole } from '@/lib/store/selectors';

export function useTimesheetData() {
  const store = useStore();

  const clients = useMemo(() => 
    store.clients.slice().sort((a, b) => a.name.localeCompare(b.name)),
    [store.clients]
  );

  const getProjectsForClient = (clientId: string) => 
    getClientProjects(store.projects, clientId);

  const getRolesForProject = (projectId: string) => {
    const project = store.projects.find(p => p.id === projectId);
    return getProjectRoles(store.roles, project);
  };

  const getProjectRoleDetails = (projectId: string, roleId: string) => {
    const project = store.projects.find(p => p.id === projectId);
    return getProjectRole(store.roles, project, roleId);
  };

  return {
    clients,
    getProjectsForClient,
    getRolesForProject,
    getProjectRoleDetails,
  };
}