export interface ProjectRole {
  id: string;
  name: string;
  projectId: string;
  costRate: number;
  sellRate: number;
  billable: boolean;
  projectId: string;
}

export interface Client {
  id: string;
  name: string;
  email: string;
}

export interface ProjectWithStatus {
  id: string;
  name: string;
  clientName: string;
  totalHours: number;
  status: 'unsubmitted' | 'pending' | 'approved' | 'rejected' | 'withdrawn';
}

export interface Project {
  id: string;
  name: string;
  clientId: string;
  budget: number;
  startDate: string;
  endDate: string;
  approverEmail: string;
  requiresApproval: boolean;
  roles: ProjectRole[];
  overtimeInclusive: boolean;
}

export interface TimeEntry {
  id: string;
  userId: string;
  clientId: string;
  projectId: string;
  roleId: string;
  date: string;
  hours: number;
  description?: string;
}

export interface ReportFilters {
  type?: 'time' | 'overtime';
  startDate: string;
  endDate: string;
  clientIds: string[];
  projectIds: string[];
  roleIds: string[];
}

export interface ReportEntry {
  id: string;
  date: string;
  clientName: string;
  projectName: string;
  roleName: string;
  hours: number;
  cost: number;
  revenue: number;
  profit: number;
}

export interface ReportSummary {
  totalHours: number;
  totalCost: number;
  totalRevenue: number;
  profitMargin: number;
}

export interface User {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'user';
  overtime: 'no' | 'eligible' | 'all';
  hoursPerWeek: number;
  costRate: number;
  sellRate: number;
  xeroEmployeeId?: string;
  createdAt: Date;
  updatedAt: Date;
  projectAssignments: ProjectAssignment[];
}

export interface ProjectAssignment {
  id: string;
  userId: string;
  projectId: string;
  roleId: string;
  clientId: string;
}

export interface ReportData {
  entries: ReportEntry[];
  summary: ReportSummary;
}

export interface OvertimeReportEntry {
  userId: string;
  userName: string;
  overtimeType: 'no' | 'billable' | 'all';
  hoursPerWeek: number;
  totalHours: number;
  overtimeHours: number;
  projects: {
    projectId: string;
    projectName: string;
    hours: number;
    overtimeHours: number;
  }[];
}

export interface OvertimeReportData {
  entries: OvertimeReportEntry[];
  summary: {
    totalOvertimeHours: number;
    totalUsers: number;
  };
}

export interface ApprovalStatus {
  status: 'unsubmitted' | 'pending' | 'approved' | 'rejected' | 'withdrawn';
  approvalId: string;
}

export interface Approval {
  id: string;
  compositeKey: string;  // Composite key for querying: {projectId}_{startDate}_{endDate}_{userId}
  status: 'unsubmitted' | 'pending' | 'approved' | 'rejected' | 'withdrawn';
  submittedAt: Date;
  approvedAt?: Date;
  rejectedAt?: Date;
  name: string;
  withdrawnAt?: Date;
  userId: string;
  approverEmail: string;
}

export interface SystemConfig {
  defaultHoursPerWeek: number;
  defaultOvertimeType: 'no' | 'eligible' | 'all';
  requireApprovalsByDefault: boolean;
  allowOvertimeByDefault: boolean;
  defaultBillableStatus: boolean;
}

export interface AdminStats {
  totalUsers: number;
  totalProjects: number;
  totalHoursThisMonth: number;
  totalBillableHours: number;
  averageUtilization: number;
}

export interface TestDataOptions {
  startDate: string;
  endDate: string;
  maxDailyHours: number;
  generateApprovals: boolean;
  approvalStatus: {
    pending: number;
    approved: number;
    rejected: number;
    withdrawn: number;
  };
}

export interface ForecastEntry {
  id: string;
  month: string;          // Format: YYYY-MM
  userId: string;
  projectId: string;
  roleId: string;
  hours: number;
  isDefault: boolean;     // Indicates if this is an auto-calculated default value
  createdAt: any;         // Firestore Timestamp
  updatedAt: any;         // Firestore Timestamp
}