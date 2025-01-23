export interface User {
  id: string;
  name: string;
  email: string;
  role: 'user' | 'admin';
  teamId?: string;
  employeeType: 'employee' | 'contractor' | 'company';
  hoursPerWeek: number;
  overtime: 'no' | 'eligible' | 'all';
  xeroEmployeeId?: string;
  salary?: SalaryItem[];
  costRate?: CostRate[];
  projectAssignments?: ProjectAssignment[];
  createdAt?: any;
  updatedAt?: any;
}

export interface Team {
  id: string;
  name: string;
  managerId: string;
  createdAt?: any;
  updatedAt?: any;
}

export interface Bonus {
  id: string;
  employeeId: string;
  teamId?: string;
  date: string;
  kpis?: string;
  amount: number;
  paid: boolean;
  xeroPayRunId?: string;
  xeroPayItemId?: string;
  paidAt?: any;
  createdAt?: any;
  updatedAt?: any;
}

// Add XeroPayItem type if not already present
export interface XeroPayItem {
  id: string;
  EarningsRateID: string;
  Name: string;
  EarningsType: string;
  RateType: string;
  AccountCode: string;
  TypeOfUnits: string;
  IsExemptFromTax: boolean;
  IsExemptFromSuper: boolean;
  IsReportableAsW1: boolean;
  UpdatedDateUTC: string;
  CurrentRecord: boolean;
}

export interface Project {
  id: string;
  name: string;
  clientId: string;
  xeroContactId?: string;
  purchaseOrderNumber?: string;
  xeroProjectId?: string;
  budget: number;
  startDate: string;
  endDate: string;
  approverEmail: string;
  requiresApproval: boolean;
  overtimeInclusive: boolean;
  isActive: boolean;
  tasks: ProjectTask[];
}