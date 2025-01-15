import { collection, getDocs, query, where } from 'firebase/firestore';
import { db, functions } from '@/lib/firebase';
import { httpsCallable } from 'firebase/functions';
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
import { capitaliseFirstChar } from '../utils';

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
  const [timeEntriesSnapshot, projectsSnapshot, usersSnapshot, clientsSnapshot, approvalsSnapshot] = await Promise.all([
    getDocs(timeEntriesQuery),
    getDocs(collection(db, 'projects')), 
    getDocs(collection(db, 'users')), 
    getDocs(collection(db, 'clients')),
    getDocs(collection(db, 'approvals'))
  ]);

  // Create lookup maps
  const projects = new Map(projectsSnapshot.docs.map(doc => [doc.id, { id: doc.id, ...doc.data() }]));
  const users = new Map(usersSnapshot.docs.map(doc => [doc.id, { id: doc.id, ...doc.data() }]));
  const clients = new Map(clientsSnapshot.docs.map(doc => [doc.id, { id: doc.id, ...doc.data() }]));
  const approvals = approvalsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

  // Filter and transform time entries
  const entries: ReportEntry[] = timeEntriesSnapshot.docs
    .map(doc => {
      const entry = doc.data();
      
      // Apply user filter
      if (filters.userId && entry.userId !== filters.userId) return null;

      // Apply project filter 
      if (filters.projectId && entry.projectId !== filters.projectId) return null;

      const project = projects.get(entry.projectId);
      const projectTask = project?.tasks?.find(r => r.id === entry.taskId);
      const client = clients.get(entry.clientId);
      const user = users.get(entry.userId);
      
      if (!project || !projectTask || !client || !user) return null;

      // Get rates from project tasks
      const costRate = projectTask?.costRate || 0;
      const sellRate = projectTask?.sellRate || 0;

      const hours = entry.hours || 0;
      const cost = hours * costRate;
      const revenue = hours * sellRate;

      // Get approval status
      let approvalStatus = project.requiresApproval 
        ? 'No Approval'
        : 'Approval Not Required';

      if (project.requiresApproval) {
        const approval = approvals.find(a => 
          a.project?.id === project.id &&
          parseISO(a.startDate) <= parseISO(entry.date) &&
          parseISO(a.endDate) >= parseISO(entry.date)
        );
        if (approval) {
          approvalStatus = capitaliseFirstChar((approval as any).status);
        }
      }

      return {
        id: doc.id,
        date: entry.date,
        userName: user.name,
        clientName: client.name,
        projectName: project.name,
        taskName: projectTask.name,
        approvalStatus,
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

  // Add approvals to response for debugging
  const filteredApprovals = approvals.filter(approval => {
    const approvalStart = parseISO(approval.startDate);
    const approvalEnd = parseISO(approval.endDate);
    const filterStart = parseISO(filters.startDate);
    const filterEnd = parseISO(filters.endDate);
    return approvalStart <= filterEnd && approvalEnd >= filterStart;
  });

  // Calculate profit margin
  summary.profitMargin = summary.totalRevenue > 0
    ? Math.round(((summary.totalRevenue - summary.totalCost) / summary.totalRevenue) * 100)
    : 0;

  return {
    entries: entries.sort((a, b) => a.date.localeCompare(b.date)),
    summary,
    approvals: filteredApprovals
  };
}

export async function submitOvertime(
  overtimeData: OvertimeReportData,
  startDate: string,
  endDate: string,
  month: string
): Promise<void> {
  // First check if already submitted
  const submissionRef = collection(db, 'overtimeSubmissions');
  const q = query(
    submissionRef,
    where('submissionMonth', '==', month)
  );
  
  const snapshot = await getDocs(q);
  if (!snapshot.empty) {
    throw new Error('Overtime has already been submitted for this month');
  }

  // Get all users
  const usersSnapshot = await getDocs(collection(db, 'users'));
  const users = usersSnapshot.docs;
  const overtimeEntries = overtimeData.entries.map(entry => ({
    ...entry,
    xeroEmployeeId: users.find(u => u.id === entry.userId)?.data().xeroEmployeeId,
  }));

  // Call Firebase function to process overtime
  const processOvertime = httpsCallable(functions, 'processOvertime');
  await processOvertime({ 
    overtimeEntries: overtimeEntries,
    startDate,
    endDate
  });
}

export async function checkOvertimeSubmission(month: string): Promise<boolean> {
  const submissionRef = collection(db, 'overtimeSubmissions');
  const q = query(
    submissionRef,
    where('submissionMonth', '==', month)
  );
  
  const snapshot = await getDocs(q);
  return !snapshot.empty;
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
    getDocs(
      collection(db, 'approvals'),
      where('startDate', '=', filters.startDate),
      where('endDate', '=', filters.endDate))
  ]);

  // Create lookup maps
  const users = new Map(usersSnapshot.docs.map(doc => [doc.id, { id: doc.id, ...doc.data() }]));
  const projects = new Map(projectsSnapshot.docs.map(doc => [doc.id, { id: doc.id, ...doc.data() }]));
  const timeEntries = timeEntriesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as TimeEntry[];
  const approvals = approvalsSnapshot.docs.map(doc => ({ 
    id: doc.id, 
    ...doc.data(),
    startDate: doc.data().startDate,
    endDate: doc.data().endDate,
    project: doc.data().project,
    userId: doc.data().userId
  })) as Approval[];

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
    const entryDate = parseISO(entry.date);
    
    if (!user || !project) return;

    // Skip users with no overtime
    if (user.overtime === 'no') return;

    // For eligible overtime, only include overtime-inclusive projects
    if (user.overtime === 'eligible' && !project.overtimeInclusive) return;
    
    // Track approval status for projects requiring approval
    if (project.requiresApproval) {
      const approval = approvals.find(a => 
        a.project.id === project.id &&
        a.userId === user.id &&
        parseISO(a.startDate) <= entryDate &&
        parseISO(a.endDate) >= entryDate
      );
      // Include the hours but mark as unsubmitted/pending as appropriate
      if (!approval) {
        entry.approvalStatus = 'unsubmitted';
      } else {
        entry.approvalStatus = approval.status;
      }
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
          
          // Get all approvals for this project/user
          const projectApprovals = approvals.filter(a => 
            a.project.id === projectId && 
            a.userId === user.id
          );

          // Determine approval status
          let approvalStatus = 'approved';
          if (project?.requiresApproval) {
            if (projectApprovals.length === 0) {
              approvalStatus = 'unsubmitted';
            } else if (projectApprovals.some(a => a.status === 'pending')) {
              approvalStatus = 'pending';
            } else if (!projectApprovals.some(a => a.status === 'approved')) {
              approvalStatus = 'rejected';
            }
          }
          
          return {
            projectId,
            projectName: project?.name || 'Unknown Project',
            hours,
            overtimeHours: projectOvertimeHours,
            requiresApproval: project?.requiresApproval || false,
            approvalStatus,
            isApproved: approvalStatus === 'approved' || !project?.requiresApproval
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