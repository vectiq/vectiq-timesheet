import { addMonths, format, parseISO, getDaysInMonth, isWeekend, startOfMonth, endOfMonth, eachDayOfInterval } from 'date-fns';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { getUsers } from './users';
import { getRoles } from './roles';
import type { ForecastEntry, ProjectForecast, WorkingDays, UserForecast } from '@/types/forecasting';

// Dummy data for holidays in Canberra
const CANBERRA_HOLIDAYS_2024 = [
  { date: '2024-01-01', name: 'New Year\'s Day' },
  { date: '2024-01-26', name: 'Australia Day' },
  { date: '2024-03-11', name: 'Canberra Day' },
  { date: '2024-03-29', name: 'Good Friday' },
  { date: '2024-04-25', name: 'ANZAC Day' },
  { date: '2024-05-27', name: 'Reconciliation Day' },
  { date: '2024-06-10', name: 'King\'s Birthday' },
  { date: '2024-10-07', name: 'Labour Day' },
  { date: '2024-12-25', name: 'Christmas Day' },
  { date: '2024-12-26', name: 'Boxing Day' },
];

interface GenerateForecastOptions {
  yearType?: 'calendar' | 'financial';
  year?: number;
}

export function generateDummyForecasts(
  startMonth: string,
  months: number = 12,
  options: GenerateForecastOptions = {}
): ProjectForecast[] {
  const forecasts: ProjectForecast[] = [];
  const { yearType = 'calendar', year = new Date().getFullYear() } = options;
  
  // Calculate start date based on year type
  const startDate = yearType === 'calendar'
    ? new Date(year, 0, 1)  // January 1st
    : new Date(year, 6, 1); // July 1st
  
  for (let i = 0; i < months; i++) {
    const date = addMonths(startDate, i);
    const month = format(date, 'yyyy-MM');
    const variance = Math.random() * 20 - 10; // Random variance between -10% and +10%
    
    forecasts.push({
      id: crypto.randomUUID(),
      projectId: 'project1',
      month,
      totalForecastedHours: 160,
      totalActualHours: 160 * (1 + variance / 100),
      totalForecastedCost: 16000,
      totalActualCost: 16000 * (1 + variance / 100),
      totalForecastedRevenue: 32000,
      totalActualRevenue: 32000 * (1 + variance / 100),
      grossMargin: 50,
      actualGrossMargin: 50 * (1 + variance / 100),
      variance: {
        hours: variance,
        cost: variance,
        revenue: variance,
        grossMargin: variance
      }
    });
  }
  
  return forecasts;
}

export function getWorkingDays(month: string): WorkingDays {
  const date = parseISO(month + '-01');
  const monthStart = startOfMonth(date);
  const monthEnd = endOfMonth(date);
  const totalDays = getDaysInMonth(date);
  
  // Get all days in the month
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd });
  
  // Get holidays for this month
  const holidays = CANBERRA_HOLIDAYS_2024.filter(h => h.date.startsWith(month));
  const holidayDates = new Set(holidays.map(h => h.date));
  
  // Count working days (excluding weekends and holidays)
  const workingDays = days.filter(day => {
    const dateStr = format(day, 'yyyy-MM-dd');
    return !isWeekend(day) && !holidayDates.has(dateStr);
  }).length;
  
  return {
    month,
    totalDays,
    workingDays,
    holidays
  };
}

export async function getUserForecasts(month: string): Promise<UserForecast[]> {
  // Calculate working days for the month
  const { workingDays } = getWorkingDays(month);
  
  // Get all users and their rates
  const users = await getUsers();
  const roles = await getRoles();
  
  // Get project roles for rate overrides
  const projectRolesSnapshot = await getDocs(collection(db, 'projectRoles'));
  const projectRoles = new Map();
  projectRolesSnapshot.docs.forEach(doc => {
    const data = doc.data();
    const key = `${data.projectId}_${data.roleId}`;
    projectRoles.set(key, data);
  });

  // Get all project assignments
  const assignmentsSnapshot = await getDocs(collection(db, 'projectAssignments'));
  const assignments = assignmentsSnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  }));

  // Get all projects
  const projectsSnapshot = await getDocs(collection(db, 'projects'));
  const projects = new Map(projectsSnapshot.docs.map(doc => [doc.id, { id: doc.id, ...doc.data() }]));

  return users.map(user => {
    const userAssignments = assignments.filter(a => a.userId === user.id);
    const defaultMonthlyHours = (user.hoursPerWeek || 40) * (workingDays / 5);
    const hoursPerAssignment = defaultMonthlyHours / Math.max(userAssignments.length, 1);

    const projectAssignments = userAssignments.map(assignment => {
      const project = projects.get(assignment.projectId);
      const role = roles.find(r => r.id === assignment.roleId);
      
      // Check for role rate override
      const roleRateKey = `${assignment.projectId}_${assignment.roleId}`;
      const roleRates = projectRoles.get(roleRateKey);
      
      // Use role rates if defined, otherwise fall back to user rates
      const costRate = roleRates?.costRate ?? user.costRate ?? 0;
      const sellRate = roleRates?.sellRate ?? user.sellRate ?? 0;

      return {
        projectId: assignment.projectId,
        projectName: project?.name || 'Unknown Project',
        roleId: assignment.roleId,
        roleName: role?.name || 'Unknown Role',
        forecastedHours: hoursPerAssignment,
        costRate,
        sellRate
      };
    });

    return {
      userId: user.id,
      userName: user.name,
      projectAssignments
    };
  });
}