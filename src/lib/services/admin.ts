import { doc, getDoc, setDoc, collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { format, startOfMonth, endOfMonth } from 'date-fns';
import type { SystemConfig, AdminStats } from '@/types';

const CONFIG_DOC = 'system_config';

export async function getSystemConfig(): Promise<SystemConfig> {
  const configRef = doc(db, 'config', CONFIG_DOC);
  const configDoc = await getDoc(configRef);
  
  if (!configDoc.exists()) {
    // Return default config if none exists
    return {
      defaultHoursPerWeek: 40,
      defaultOvertimeType: 'no',
      requireApprovalsByDefault: true,
      allowOvertimeByDefault: false,
      defaultBillableStatus: true
    };
  }
  
  return configDoc.data() as SystemConfig;
}

export async function updateSystemConfig(config: SystemConfig): Promise<void> {
  const configRef = doc(db, 'config', CONFIG_DOC);
  await setDoc(configRef, config);
}

export async function getAdminStats(): Promise<AdminStats> {
  const now = new Date();
  const monthStart = startOfMonth(now);
  const monthEnd = endOfMonth(now);

  // Get all required collections
  const [usersSnapshot, projectsSnapshot, timeEntriesSnapshot] = await Promise.all([
    getDocs(collection(db, 'users')),
    getDocs(collection(db, 'projects')),
    getDocs(query(
      collection(db, 'timeEntries'),
      where('date', '>=', format(monthStart, 'yyyy-MM-dd')),
      where('date', '<=', format(monthEnd, 'yyyy-MM-dd'))
    ))
  ]);

  // Calculate stats
  const totalUsers = usersSnapshot.size;
  const totalProjects = projectsSnapshot.size;
  
  let totalHours = 0;
  let billableHours = 0;
  
  // Create a map of project roles for billable status lookup
  const projectRoles = new Map();
  projectsSnapshot.docs.forEach(doc => {
    const project = doc.data();
    project.roles?.forEach(role => {
      projectRoles.set(`${project.id}_${role.id}`, role.billable);
    });
  });

  // Calculate hours
  timeEntriesSnapshot.docs.forEach(doc => {
    const entry = doc.data();
    const hours = entry.hours || 0;
    totalHours += hours;
    
    // Check if the role is billable
    const roleKey = `${entry.projectId}_${entry.roleId}`;
    if (projectRoles.get(roleKey)) {
      billableHours += hours;
    }
  });

  // Calculate utilization (billable hours / total hours)
  const averageUtilization = totalHours > 0 
    ? Math.round((billableHours / totalHours) * 100)
    : 0;

  return {
    totalUsers,
    totalProjects,
    totalHoursThisMonth: totalHours,
    totalBillableHours: billableHours,
    averageUtilization
  };
}

export async function recalculateProjectTotals(): Promise<void> {
  // Implementation for recalculating project totals
  // This would update cached totals, verify data consistency, etc.
}

export async function cleanupOrphanedData(): Promise<void> {
  // Implementation for cleaning up orphaned data
  // This would remove entries without valid references, etc.
}

export async function validateTimeEntries(): Promise<{
  invalid: number;
  fixed: number;
}> {
  // Implementation for validating time entries
  // This would check for data consistency, fix issues, etc.
  return { invalid: 0, fixed: 0 };
}