export interface User {
  email: string;
  role: 'user' | 'admin';
  teamId?: string;
  estimatedBillablePercentage?: number;
  employeeType: 'employee' | 'contractor' | 'company';
  hoursPerWeek: number;
  overtime: 'no' | 'eligible' | 'all';
}

export interface PublicHoliday {
  id: string;
  name: string;
  date: string;
  createdAt?: any;
}

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
  purchaseOrderNumber?: string;
  xeroProjectId?: string;
  startDate: string;
  endDate: string;
  xeroContactId?: string;
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