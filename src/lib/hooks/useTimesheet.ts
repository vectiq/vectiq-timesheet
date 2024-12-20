import { useState, useCallback } from 'react';
import { useTimeEntries } from './useTimeEntries';
import { useProjects } from './useProjects';
import { useClients } from './useClients';
import { useRoles } from './useRoles';
import type { TimeEntry, Project, Client, Role } from '@/types';

interface UseTimesheetProps {
  dateRange: {
    start: Date;
    end: Date;
  };
}

export function useTimesheet({ dateRange }: UseTimesheetProps) {
  const { timeEntries, createTimeEntry, updateTimeEntry } = useTimeEntries({ dateRange });
  const { projects } = useProjects();
  const { clients } = useClients();
  const { roles } = useRoles();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Create lookup maps for better performance
  const projectMap = new Map(projects.map(p => [p.id, p]));
  const clientMap = new Map(clients.map(c => [c.id, c]));
  const roleMap = new Map(roles.map(r => [r.id, r]));

  const getEntryDetails = useCallback((entry: TimeEntry) => {
    const project = projectMap.get(entry.projectId) || null;
    const client = project ? clientMap.get(project.clientId) || null : null;
    const role = roleMap.get(entry.roleId) || null;

    return { project, client, role };
  }, [projectMap, clientMap, roleMap]);

  const handleSave = useCallback(async (entries: TimeEntry[]) => {
    setIsSubmitting(true);
    try {
      for (const entry of entries) {
        if (entry.id) {
          await updateTimeEntry(entry);
        } else {
          await createTimeEntry(entry);
        }
      }
    } finally {
      setIsSubmitting(false);
    }
  }, [createTimeEntry, updateTimeEntry]);

  return {
    timeEntries,
    projects,
    clients,
    roles,
    isSubmitting,
    getEntryDetails,
    handleSave,
  };
}