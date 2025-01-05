import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { format } from 'date-fns';
import type { ReportFilters, ReportData, ReportEntry } from '@/types';

export async function generateReport(filters: ReportFilters): Promise<ReportData> {
  // Get time entries
  const timeEntriesRef = collection(db, 'timeEntries');
  let timeEntriesQuery = query(timeEntriesRef);

  // Apply date filters
  if (filters.startDate) {
    timeEntriesQuery = query(timeEntriesQuery, where('date', '>=', filters.startDate));
  }
  if (filters.endDate) {
    timeEntriesQuery = query(timeEntriesQuery, where('date', '<=', filters.endDate));
  }

  // Get all required data
  const [timeEntriesSnapshot, projectsSnapshot, rolesSnapshot, clientsSnapshot] = await Promise.all([
    getDocs(timeEntriesQuery),
    getDocs(collection(db, 'projects')),
    getDocs(collection(db, 'roles')),
    getDocs(collection(db, 'clients'))
  ]);

  // Create lookup maps
  const projects = new Map(projectsSnapshot.docs.map(doc => [doc.id, { id: doc.id, ...doc.data() }]));
  const roles = new Map(rolesSnapshot.docs.map(doc => [doc.id, { id: doc.id, ...doc.data() }]));
  const clients = new Map(clientsSnapshot.docs.map(doc => [doc.id, { id: doc.id, ...doc.data() }]));

  // Get project roles for rate calculations
  const projectRolesSnapshot = await getDocs(collection(db, 'projectRoles'));
  const projectRoles = new Map();
  projectRolesSnapshot.docs.forEach(doc => {
    const data = doc.data();
    const key = `${data.projectId}_${data.roleId}`;
    projectRoles.set(key, data);
  });

  // Filter and transform time entries
  const entries: ReportEntry[] = timeEntriesSnapshot.docs
    .map(doc => {
      const entry = doc.data();
      
      // Apply filters
      if (filters.clientIds.length && !filters.clientIds.includes(entry.clientId)) return null;
      if (filters.projectIds.length && !filters.projectIds.includes(entry.projectId)) return null;
      if (filters.roleIds.length && !filters.roleIds.includes(entry.roleId)) return null;

      const project = projects.get(entry.projectId);
      const role = roles.get(entry.roleId);
      const client = clients.get(entry.clientId);
      
      if (!project || !role || !client) return null;

      // Get rates from project roles
      const projectRole = projectRoles.get(`${entry.projectId}_${entry.roleId}`);
      const costRate = projectRole?.costRate || 0;
      const sellRate = projectRole?.sellRate || 0;

      const hours = entry.hours || 0;
      const cost = hours * costRate;
      const revenue = hours * sellRate;

      return {
        id: doc.id,
        date: entry.date,
        clientName: client.name,
        projectName: project.name,
        roleName: role.name,
        hours,
        cost,
        revenue,
        profit: revenue - cost
      };
    })
    .filter(Boolean) as ReportEntry[];

  // Calculate summary
  const summary = entries.reduce((acc, entry) => ({
    totalHours: acc.totalHours + entry.hours,
    totalCost: acc.totalCost + entry.cost,
    totalRevenue: acc.totalRevenue + entry.revenue,
    profitMargin: 0 // Calculated below
  }), {
    totalHours: 0,
    totalCost: 0,
    totalRevenue: 0,
    profitMargin: 0
  });

  // Calculate profit margin
  summary.profitMargin = summary.totalRevenue > 0
    ? Math.round(((summary.totalRevenue - summary.totalCost) / summary.totalRevenue) * 100)
    : 0;

  return {
    entries: entries.sort((a, b) => a.date.localeCompare(b.date)),
    summary
  };
}