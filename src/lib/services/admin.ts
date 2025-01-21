import { doc, getDoc, setDoc, collection, getDocs, query, where, writeBatch } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, parseISO, startOfWeek } from 'date-fns';
import type { SystemConfig, AdminStats, TestDataOptions, XeroConfig, FirestoreCollection, XeroPayItem } from '@/types';

const CONFIG_DOC = 'system_config';
const XERO_CONFIG_DOC = 'xero_config';

export async function getXeroConfig(): Promise<XeroConfig> {
  const configRef = doc(db, 'config', XERO_CONFIG_DOC);
  const configDoc = await getDoc(configRef);
  const payItemsSnapshot = await getDocs(collection(db, 'xeroPayItems'));
  const payItems = payItemsSnapshot.docs.map(doc => doc.data() as XeroPayItem);
  
  if (!configDoc.exists()) {
    return {
      clientId: '',
      tenantId: '',
      redirectUri: '',
      overtimePayItemCode: '',
      ordinaryHoursEarningsId: '',
      scopes: [],
      payItems: []
    };
  }
  
  return {
    ...configDoc.data() as XeroConfig,
    payItems
  };
}

export async function updateXeroConfig(config: XeroConfig): Promise<void> {
  const configRef = doc(db, 'config', XERO_CONFIG_DOC);
  await setDoc(configRef, config);
}

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
  
  // Create a map of project tasks for billable status lookup
  const projectTasks = new Map();
  projectsSnapshot.docs.forEach(doc => {
    const project = doc.data();
    project.tasks?.forEach(task => {
      projectTasks.set(`${project.id}_${task.id}`, task.billable);
    });
  });

  // Calculate hours
  timeEntriesSnapshot.docs.forEach(doc => {
    const entry = doc.data();
    const hours = entry.hours || 0;
    totalHours += hours;
    
    // Check if the task is billable
    const taskKey = `${entry.projectId}_${entry.taskId}`;
    if (projectTasks.get(taskKey)) {
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

export async function generateTestData(options: TestDataOptions): Promise<void> {
  const batch = writeBatch(db);
  
  // Get all users, projects, and tasks
  const [usersSnapshot, projectsSnapshot] = await Promise.all([
    getDocs(collection(db, 'users')),
    getDocs(collection(db, 'projects'))
  ]);

  const users = usersSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  const projects = projectsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

  // Get all days by month
  const days = eachDayOfInterval({
    start: parseISO(options.startDate),
    end: parseISO(options.endDate)
  });

  // Group days by month
  const months = days.reduce((acc, day) => {
    const monthStart = startOfMonth(day);
    const key = format(monthStart, 'yyyy-MM-dd');
    if (!acc[key]) {
      acc[key] = [];
    }
    acc[key].push(day);
    return acc;
  }, {});

  // For each user
  for (const user of users) {
    const userAssignments = user.projectAssignments || [];
    if (userAssignments.length === 0) continue;
    const minWeeklyHours = user.hoursPerWeek || 40;

    // For each month
    Object.entries(months).forEach(([monthStart, monthDays]) => {
      const weeksInMonth = Math.ceil(monthDays.length / 5);
      const minMonthlyHours = minWeeklyHours * weeksInMonth;
      const maxMonthlyHours = Math.min(minMonthlyHours * 1.5, monthDays.length * options.maxDailyHours);
      const targetMonthlyHours = minMonthlyHours + Math.floor(Math.random() * (maxMonthlyHours - minMonthlyHours));

      // Ensure we meet minimum monthly hours
      let totalMonthlyHours = 0;
      const shuffledDays = [...monthDays].sort(() => Math.random() - 0.5);
      const dailyMinHours = Math.ceil(minMonthlyHours / monthDays.length);

      for (const day of shuffledDays) {
        const dateStr = format(day, 'yyyy-MM-dd');
        const maxDayHours = Math.min(options.maxDailyHours, targetMonthlyHours - totalMonthlyHours);
        let dailyHours = Math.max(dailyMinHours, Math.min(maxDayHours, Math.floor(Math.random() * 4) + 4));
        let remainingDayHours = dailyHours;

        // Distribute day's hours across projects
        const shuffledAssignments = [...userAssignments].sort(() => Math.random() - 0.5);
        const hoursPerAssignment = Math.max(1, Math.floor(remainingDayHours / shuffledAssignments.length));

        for (const assignment of shuffledAssignments) {
          if (remainingDayHours <= 0) break;

          const hours = Math.min(
            remainingDayHours,
            hoursPerAssignment + Math.floor(Math.random() * 2)
          );

          const entryRef = doc(collection(db, 'timeEntries'));
          batch.set(entryRef, {
            id: entryRef.id,
            userId: user.id,
            clientId: assignment.clientId,
            projectId: assignment.projectId,
            taskId: assignment.taskId,
            date: dateStr,
            hours,
            description: 'Test data entry',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          });

          remainingDayHours -= hours;
          totalWeeklyHours += hours;
        }
      }
    });
  }

  // Generate approvals if requested
  if (options.generateApprovals) {
    const totalWeight = Object.values(options.approvalStatus).reduce((a, b) => a + b, 0);
    
    for (const project of projects) {
      if (!project.requiresApproval) continue;

      for (const user of users) {
        const hasAssignment = user.projectAssignments?.some(
          a => a.projectId === project.id
        );
        if (!hasAssignment) continue;

        // Generate approval with weighted random status
        const rand = Math.random() * totalWeight;
        let status: string;
        let sum = 0;

        if (rand < (sum += options.approvalStatus.pending)) {
          status = 'pending';
        } else if (rand < (sum += options.approvalStatus.approved)) {
          status = 'approved';
        } else if (rand < (sum += options.approvalStatus.rejected)) {
          status = 'rejected';
        } else {
          status = 'withdrawn';
        }

        const approvalRef = doc(collection(db, 'approvals'));
        batch.set(approvalRef, {
          id: approvalRef.id,
          userId: user.id,
          project,
          status,
            startDate: options.startDate,
            endDate: options.endDate,
          submittedAt: new Date(),
          ...(status === 'approved' && { approvedAt: new Date() }),
          ...(status === 'rejected' && { rejectedAt: new Date() }),
          ...(status === 'withdrawn' && { withdrawnAt: new Date() })
        });
      }
    }
  }

  await batch.commit();
}

export async function clearTestData(): Promise<void> {
  const batch = writeBatch(db);
  
  // Delete all time entries
  const timeEntriesSnapshot = await getDocs(collection(db, 'timeEntries'));
  timeEntriesSnapshot.docs.forEach(doc => {
    batch.delete(doc.ref);
  });

  // Delete all approvals
  const approvalsSnapshot = await getDocs(collection(db, 'approvals'));
  approvalsSnapshot.docs.forEach(doc => {
    batch.delete(doc.ref);
  });

  await batch.commit();
}

export async function recalculateProjectTotals(): Promise<void> {
  // Implementation for recalculating project totals
  console.log('Recalculating project totals');
}

export async function cleanupOrphanedData(): Promise<void> {
  // Implementation for cleaning up orphaned data
  console.log('Cleaning up orphaned data');
}

export async function validateTimeEntries(): Promise<{
  invalid: number;
  fixed: number;
}> {
  // Implementation for validating time entries
  return { invalid: 0, fixed: 0 };
}

export async function exportCollectionAsJson(collectionName: string): Promise<FirestoreCollection> {
  try {
    // Validate collection name
    if (!collectionName) {
      throw new Error('Collection name is required');
    }

    // Get collection reference
    const collectionRef = collection(db, collectionName);
    const snapshot = await getDocs(collectionRef);

    // Transform documents into JSON
    const documents = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    return {
      name: collectionName,
      documentCount: documents.length,
      documents,
      exportedAt: new Date().toISOString()
    };
  } catch (error) {
    console.error(`Error exporting collection ${collectionName}:`, error);
    throw error;
  }
}