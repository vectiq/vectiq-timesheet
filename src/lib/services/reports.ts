import { mockTimeEntries } from './mockData';
import type { ReportFilters, ReportData, ReportEntry } from '@/types';

export async function generateReport(filters: ReportFilters): Promise<ReportData> {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 500));

  // Filter time entries based on criteria
  const entries: ReportEntry[] = mockTimeEntries
    .filter(entry => {
      if (filters.startDate && entry.date < filters.startDate) return false;
      if (filters.endDate && entry.date > filters.endDate) return false;
      if (filters.projectIds.length && !filters.projectIds.includes(entry.projectId)) return false;
      if (filters.roleIds.length && !filters.roleIds.includes(entry.projectRoleId)) return false;
      return true;
    })
    .map(entry => ({
      id: entry.id,
      date: entry.date,
      clientName: 'Acme Corp', // In real app, get from relationships
      projectName: 'Website Redesign',
      roleName: 'Senior Developer',
      hours: entry.hours,
      cost: entry.hours * 75, // In real app, get from role.costRate
      revenue: entry.hours * 150, // In real app, get from role.sellRate
      profit: entry.hours * (150 - 75),
    }));

  // Calculate summary
  const totalHours = entries.reduce((sum, entry) => sum + entry.hours, 0);
  const totalCost = entries.reduce((sum, entry) => sum + entry.cost, 0);
  const totalRevenue = entries.reduce((sum, entry) => sum + entry.revenue, 0);
  const profitMargin = totalRevenue > 0 
    ? Math.round((totalRevenue - totalCost) / totalRevenue * 100) 
    : 0;

  return {
    entries,
    summary: {
      totalHours,
      totalCost,
      totalRevenue,
      profitMargin,
    },
  };
}