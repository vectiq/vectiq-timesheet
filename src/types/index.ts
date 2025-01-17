export interface ProjectTask {
  id: string;
  name: string;
  projectId: string;
  costRate: number;
  sellRate: number;
  billable: boolean;
  teamId?: string;
  xeroLeaveTypeId?: string;
  active: boolean;
  userAssignments: UserAssignment[];
}

export interface UserAssignment {
  id: string;
  userId: string;
  userName: string;
  assignedAt: string;
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
  tasks: ProjectTask[];
  overtimeInclusive: boolean;
}

export interface TimeEntry {
  id: string;
  userId: string;
  clientId: string;
  projectId: string;
  taskId: string;
  date: string;
  hours: number;
  description?: string;
}

export interface ReportFilters {
  type?: 'time' | 'overtime';
  startDate: string;
  endDate: string;
  userId?: string;
  projectId?: string;
}

export interface ReportEntry {
  id: string;
  date: string;
  userName: string;
  clientName: string;
  projectName: string;
  taskName: string;
  approvalStatus: string;
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

export interface SalaryItem{
  salary: number;
  date: string;  // ISO date string
}

export interface CostRate{
  costRate: number;
  date: string;  // ISO date string
}

export interface User {
  id: string;
  email: string;
  name: string;
  employeeType: 'employee' | 'contractor' | 'company';
  role: 'admin' | 'user';
  overtime: 'no' | 'eligible' | 'all';
  hoursPerWeek: number;
  teamId?: string;
  xeroEmployeeId?: string;
  salary?: SalaryItem[];
  costRate?: CostRate[];
  createdAt: Date;
  updatedAt: Date;
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
    requiresApproval: boolean;
    isApproved: boolean;
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
  status: 'unsubmitted' | 'pending' | 'approved' | 'rejected' | 'withdrawn';
  submittedAt: Date;
  approvedAt?: Date;
  rejectedAt?: Date;
  withdrawnAt?: Date;
  userId: string;
  approverEmail: string;
  project: Project;
  client: Client;
  startDate: string;
  endDate: string;
  totalHours: number;
}

export interface ApprovalRequest {
  project: Project;
  client: Client;
  dateRange: {
    start: Date;
    end: Date;
  };
  entries: TimeEntry[];
  userId: string;
}

export interface SystemConfig {
  defaultHoursPerWeek: number;
  defaultOvertimeType: 'no' | 'eligible' | 'all';
  requireApprovalsByDefault: boolean;
  allowOvertimeByDefault: boolean;
  defaultBillableStatus: boolean;
  payrollTaxPercentage: number;
  payrollTaxFreeThreshold: number;
  insurancePercentage: number;
  superannuationPercentage: number;
  costRateFormula: string;
}

export interface XeroConfig {
  clientId: string;
  redirectUri: string;
  tenantId: string;
  overtimePayItemCode: string;
  ordinaryHoursEarningsId: string;
  scopes: string[];
}

export interface AdminStats {
  totalUsers: number;
  totalProjects: number;
  totalHoursThisMonth: number;
  totalBillableHours: number;
  averageUtilization: number;
}

export interface ProcessingProject {
  id: string;
  name: string;
  clientId: string;
  clientName: string;
  totalHours: number;
  timesheetStatus: 'pending' | 'approved' | 'rejected' | 'withdrawn';
  invoiceStatus: 'not started' | 'draft' | 'sent';
  priority: 'normal' | 'high';
  hasSpecialHandling: boolean;
  type: 'labor_hire' | 'team';
  assignments: Array<{
    userId: string;
    userName: string;
    taskId: string;
    taskName: string;
    hours: number
  }>;
}

export interface ProcessingData {
  projects: ProcessingProject[];
  summary: {
    totalProjects: number;
    approvedTimesheets: number;
    totalRequiringApproval: number;
    generatedInvoices: number;
    urgentItems: number;
  };
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

export interface Note {
  id: string;
  text: string;
  status?: 'pending' | 'completed';
  priority?: 'low' | 'medium' | 'high';
  createdBy: string;
  createdAt: string;
  updatedAt?: string;
}

export interface ProjectProcessingNote {
  projectId: string;
  month: string; // Format: YYYY-MM
  notes: Note[];
}

export interface MonthlyProcessingNote {
  month: string; // Format: YYYY-MM
  notes: Note[];
}

export interface PayRun {
  PayRunID: string;
  PayrollCalendarID: string;
  PayRunPeriodStartDate: string; // ISO date string
  PayRunPeriodEndDate: string; // ISO date string
  PaymentDate: string; // ISO date string
  Wages: number;
  Deductions: number;
  Tax: number;
  Super: number;
  Reimbursement: number;
  NetPay: number;
  PayRunStatus: string;
  UpdatedDateUTC: string; // ISO date string
  Payslips: Payslip[];
}

export interface Payslip {
  EmployeeID: string;
  PayslipID: string;
  FirstName: string;
  LastName: string;
  Wages: number;
  Deductions: number;
  Tax: number;
  Super: number;
  Reimbursements: number;
  NetPay: number;
  UpdatedDateUTC: string; // ISO date string
}

export interface ForecastEntry {
  id: string;
  month: string;          // Format: YYYY-MM
  userId: string;
  projectId: string;
  taskId: string;
  hours: number;
  isDefault: boolean;     // Indicates if this is an auto-calculated default value
  createdAt: any;         // Firestore Timestamp
  updatedAt: any;         // Firestore Timestamp
}

export interface Leave {
  id: string;
  employeeId: string;
  leaveTypeId: string;
  title: string;
  description?: string;
  startDate: string;
  endDate: string;
  status: 'REQUESTED' | 'SCHEDULED' | 'REJECTED';
  numberOfUnits: number;
  updatedAt: string;
}

export interface LeaveCache {
  leave: Leave[];
  lastRefreshed: any; // Firestore Timestamp
}

export interface LeaveBalance{
    leaveName: string,
    leaveTypeId: string,
    numberOfUnits: number,
    typeOfUnits: string
}

export interface XeroLeaveResponse {
  Id: string;
  Status: string;
}

export interface Team {
  id: string;
  name: string;
  managerId: string;
  createdAt: string;
  updatedAt: string;
  ProviderName: string;
  DateTimeUTC: string;
  LeaveBalances: Array<LeaveBalance>;
  LeaveApplications: Array<{
    LeaveApplicationID: string;
    EmployeeID: string;
    LeaveTypeID: string;
    LeavePeriods: Array<{
      PayPeriodStartDate: string;
      PayPeriodEndDate: string;
      LeavePeriodStatus: string;
      NumberOfUnits: number;
    }>;
    Title: string;
    Description?: string;
    StartDate: string;
    EndDate: string;
    UpdatedDateUTC?: string;
    PayOutType: string;
  }>;
}

export interface FirestoreCollection {
  name: string;
  documentCount: number;
  documents: any[];
  exportedAt: string;
}