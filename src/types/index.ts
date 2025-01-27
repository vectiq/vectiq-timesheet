export interface SellRate {
  sellRate: number;
  date: string;
}

export interface ProjectTask {
  id: string;
  name: string;
  projectId: string;
  sellRates: SellRate[];
  billable: boolean;
  teamId?: string;
  xeroLeaveTypeId?: string;
  userAssignments?: Array<{
    id: string;
    userId: string;
    userName: string;
    assignedAt: string;
  }>;
}

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

export interface TestDataOptions {
  startDate: string;
  endDate: string;
  maxDailyHours: number;
  minDailyHours: number;
  includeWeekends: boolean;
}

export interface SystemConfig {