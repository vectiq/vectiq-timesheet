export interface Member {
  id: string;
  name?: string;
  email: string;
  role: 'admin' | 'consultant';
  status: 'active' | 'pending';
  joinedAt?: string;
}

export interface Client {
  id: string;
  name: string;
  email: string;
  approverEmail: string;
}

export interface ProjectRole {
  id: string;
  name: string;
  costRate: number;
  sellRate: number;
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
  projectId: string;
  projectRoleId: string;
  date: string;
  hours: number;
  description?: string;
  status: 'draft' | 'pending' | 'approved' | 'rejected';
  submittedAt?: string;
  approvedAt?: string;
}