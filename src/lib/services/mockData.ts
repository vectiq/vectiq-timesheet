import { addDays, format, eachWeekOfInterval, eachDayOfInterval, subMonths } from 'date-fns';
import type { Role, Project, Client, TimeEntry, ProjectRole } from '@/types';

// Mock Roles
export const mockRoles: Role[] = [
  { id: 'role_1', name: 'Senior Developer', isActive: true },
  { id: 'role_2', name: 'Project Manager', isActive: true },
  { id: 'role_3', name: 'UI/UX Designer', isActive: true },
  { id: 'role_4', name: 'Business Analyst', isActive: true },
  { id: 'role_5', name: 'QA Engineer', isActive: false },
];

// Mock Clients
export const mockClients: Client[] = [
  {
    id: 'client_1',
    name: 'Acme Corporation',
    email: 'contact@acme.com',
    approverEmail: 'approver@acme.com',
  },
  {
    id: 'client_2',
    name: 'Globex Industries',
    email: 'contact@globex.com',
    approverEmail: 'approver@globex.com',
  },
  {
    id: 'client_3',
    name: 'Initech Solutions',
    email: 'contact@initech.com',
    approverEmail: 'approver@initech.com',
  },
];

// Mock Project Roles with rates
const projectRoles: Record<string, ProjectRole[]> = {
  proj_1: [
    { roleId: 'role_1', projectId: 'proj_1', costRate: 75, sellRate: 150 },
    { roleId: 'role_2', projectId: 'proj_1', costRate: 85, sellRate: 170 },
    { roleId: 'role_3', projectId: 'proj_1', costRate: 70, sellRate: 140 },
  ],
  proj_2: [
    { roleId: 'role_1', projectId: 'proj_2', costRate: 80, sellRate: 160 },
    { roleId: 'role_4', projectId: 'proj_2', costRate: 90, sellRate: 180 },
  ],
  proj_3: [
    { roleId: 'role_2', projectId: 'proj_3', costRate: 85, sellRate: 170 },
    { roleId: 'role_3', projectId: 'proj_3', costRate: 75, sellRate: 150 },
    { roleId: 'role_4', projectId: 'proj_3', costRate: 95, sellRate: 190 },
  ],
};

// Mock Projects
export const mockProjects: Project[] = [
  {
    id: 'proj_1',
    name: 'Website Redesign',
    clientId: 'client_1',
    budget: 50000,
    startDate: '2024-01-01',
    endDate: '2024-06-30',
    approverEmail: 'websiteapprover@acme.com',
    requiresApproval: true,
    roles: projectRoles.proj_1,
  },
  {
    id: 'proj_2',
    name: 'Mobile App Development',
    clientId: 'client_2',
    budget: 75000,
    startDate: '2024-02-01',
    endDate: '2024-08-31',
    approverEmail: 'mobileapprover@globex.com',
    requiresApproval: false,
    roles: projectRoles.proj_2,
  },
  {
    id: 'proj_3',
    name: 'Digital Transformation',
    clientId: 'client_3',
    budget: 120000,
    startDate: '2024-03-01',
    endDate: '2024-12-31',
    approverEmail: 'dtapprover@initech.com',
    requiresApproval: true,
    roles: projectRoles.proj_3,
  },
];

// Generate Mock Time Entries
export const mockTimeEntries: TimeEntry[] = (() => {
  const today = new Date();
  const threeMonthsAgo = subMonths(today, 3);
  const entries: TimeEntry[] = [];
  let entryId = 1;

  // Get all weeks in the last 3 months
  const weeks = eachWeekOfInterval(
    { start: threeMonthsAgo, end: today },
    { weekStartsOn: 1 }
  );

  // Common project assignments
  const assignments = [
    { projectId: 'proj_1', roleId: 'role_1', clientId: 'client_1', hours: 8 },
    { projectId: 'proj_2', roleId: 'role_1', clientId: 'client_2', hours: 4 },
    { projectId: 'proj_3', roleId: 'role_2', clientId: 'client_3', hours: 6 },
  ];

  // Generate entries for each week
  weeks.forEach(weekStart => {
    // Get workdays (Monday to Friday)
    const days = eachDayOfInterval({
      start: weekStart,
      end: addDays(weekStart, 4)
    });

    // Generate entries for each day
    days.forEach(date => {
      // Randomly select 1-2 assignments for each day
      const dayAssignments = assignments
        .filter(() => Math.random() > 0.3)
        .slice(0, 2);

      dayAssignments.forEach(assignment => {
        entries.push({
          id: `entry_${entryId++}`,
          userId: 'user_1',
          clientId: assignment.clientId,
          projectId: assignment.projectId,
          roleId: assignment.roleId,
          date: format(date, 'yyyy-MM-dd'),
          hours: assignment.hours,
          description: 'Regular work',
        });
      });
    });
  });

  return entries;
})();