import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { format, parseISO } from 'date-fns';
import { getWorkingDaysInPeriod } from '@/lib/utils/date';
import type { 
  ReportFilters, 
  ReportData, 
  ReportEntry, 
  OvertimeReportData,
  Project,
  User,
  TimeEntry,
  Approval
} from '@/types';

export async function generateReport(filters: ReportFilters): Promise<ReportData | OvertimeReportData> {
  if (filters.type === 'overtime') {
    return generateOvertimeReport(filters);
  }

  // Get time entries
  const timeEntriesQuery = query(
    collection(db, 'timeEntries'),
    where('date', '>=', filters.startDate),
    where('date', '<=', filters.endDate)
  );

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

async function generateOvertimeReport(filters: ReportFilters): Promise<OvertimeReportData> {
  // Get all required data
  const [usersSnapshot, timeEntriesSnapshot, projectsSnapshot, approvalsSnapshot] = await Promise.all([
    getDocs(collection(db, 'users')),
    getDocs(query(
      collection(db, 'timeEntries'),
      where('date', '>=', filters.startDate),
      where('date', '<=', filters.endDate)
    )),
    getDocs(collection(db, 'projects')),
    getDocs(collection(db, 'approvals'))
  ]);

  // Create lookup maps
  const users = new Map(usersSnapshot.docs.map(doc => [doc.id, { id: doc.id, ...doc.data() }]));
  const projects = new Map(projectsSnapshot.docs.map(doc => [doc.id, { id: doc.id, ...doc.data() }]));
  const timeEntries = timeEntriesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as TimeEntry[];
  const approvals = approvalsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Approval[];

  // Calculate working days in the period
  const periodStart = parseISO(filters.startDate);
  const periodEnd = parseISO(filters.endDate);
  const workingDays = getWorkingDaysInPeriod(periodStart, periodEnd);

  // Group time entries by user and week
  const userProjectHours = new Map<string, Map<string, number>>();
  const userOvertimeHours = new Map<string, Map<string, number>>();
  const userTotalHours = new Map<string, number>();

  // Process each time entry
  timeEntries.forEach(entry => {
    const user = users.get(entry.userId) as User;
    const project = projects.get(entry.projectId) as Project;
    
    if (!user || !project) return;

    // Skip users with no overtime
    if (user.overtime === 'no') return;

    // For eligible overtime, only include overtime-inclusive projects
    if (user.overtime === 'eligible' && !project.overtimeInclusive) return;

    // For projects requiring approval, only count approved hours
    if (project.requiresApproval) {
      const approval = approvals.find(a => 
        a.project.id === project.id &&
        a.userId === user.id &&
        ['approved', 'pending'].includes(a.status) &&
        parseISO(a.period.startDate) <= parseISO(entry.date) &&
        parseISO(a.period.endDate) >= parseISO(entry.date)
      );
      if (!approval) return;
    }

    // Track total hours for the user
    userTotalHours.set(user.id, (userTotalHours.get(user.id) || 0) + entry.hours);

    // Track project hours
    if (!userProjectHours.has(user.id)) {
      userProjectHours.set(user.id, new Map());
    }
    const projectHours = userProjectHours.get(user.id);
    projectHours.set(project.id, (projectHours.get(project.id) || 0) + entry.hours);
  });

  // Calculate total overtime hours
  let totalOvertimeHours = 0;
  const entries = Array.from(users.values())
    .filter(user => user.overtime !== 'no')
    .map(user => {
      // Calculate standard hours
      const standardMonthlyHours = (user.hoursPerWeek || 40) * (workingDays / 5);
      const totalHours = userTotalHours.get(user.id) || 0;
      const userOvertimeHours = Math.max(0, totalHours - standardMonthlyHours);
      
      const projectHours = userProjectHours.get(user.id) || new Map();
      const projectHoursTotal = Array.from(projectHours.values())
        .reduce((sum, hours) => sum + hours, 0);

      totalOvertimeHours += userOvertimeHours;

      // Calculate project overtime hours proportionally
      const projectOvertimeEntries = Array.from(projectHours.entries())
        .map(([projectId, hours]) => {
          const project = projects.get(projectId);
          const projectOvertimeHours = (hours / projectHoursTotal) * userOvertimeHours;
          return {
            projectId,
            projectName: project?.name || 'Unknown Project',
            hours,
            overtimeHours: projectOvertimeHours
          };
        })
        .sort((a, b) => b.hours - a.hours);

      return {
        userId: user.id,
        userName: user.name,
        overtimeType: user.overtime,
        hoursPerWeek: user.hoursPerWeek,
        totalHours,
        overtimeHours: userOvertimeHours,
        projects: projectOvertimeEntries
      };
    })
    .filter(entry => entry.overtimeHours > 0)
    .sort((a, b) => b.overtimeHours - a.overtimeHours);

  return {
    entries,
    summary: {
      totalOvertimeHours,
      totalUsers: entries.length
    }
  };
}