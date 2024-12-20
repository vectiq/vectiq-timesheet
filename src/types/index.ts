export interface Role {
  id: string;
  name: string;
  isActive: boolean;
}

export interface ProjectRole {
  roleId: string;
  projectId: string;
  costRate: number;
  sellRate: number;
}

export interface Client {
  id: string;
  name: string;
  email: string;
  approverEmail: string;
}

export interface Project {
  id: string;
  name: string;
  clientId: string;
  budget: number;
  startDate: string;
  endDate: string;
  requiresApproval: boolean;
  roles: ProjectRole[];
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
  isActive: boolean;
}

export interface ProjectAssignment {
  id: string;
  userId: string;
  projectId: string;
  roleId: string;
}

export interface ReportData {
  entries: ReportEntry[];
  summary: ReportSummary;
}