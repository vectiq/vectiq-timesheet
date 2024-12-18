import type { Member, Client, Project, ProjectRole } from '@/types';

export interface InitialData {
  members: Member[];
  clients: Client[];
  projects: Array<Project & { roles: ProjectRole[] }>;
}

export const initialData: InitialData = {
  members: [
    {
      id: 'admin',
      name: 'System Admin',
      email: 'admin@example.com',
      role: 'admin',
      status: 'active',
      joinedAt: new Date().toISOString()
    }
  ],
  clients: [
    {
      id: 'client1',
      name: 'Acme Corporation',
      email: 'contact@acme.com',
      approverEmail: 'approver@acme.com'
    },
    {
      id: 'client2',
      name: 'Globex Corporation',
      email: 'contact@globex.com',
      approverEmail: 'approver@globex.com'
    }
  ],
  projects: [
    {
      id: 'project1',
      name: 'Website Redesign',
      clientId: 'client1',
      budget: 50000,
      startDate: '2024-03-01',
      endDate: '2024-08-31',
      requiresApproval: true,
      roles: [
        {
          id: 'role1',
          name: 'Senior Developer',
          costRate: 75,
          sellRate: 150
        },
        {
          id: 'role2',
          name: 'Project Manager',
          costRate: 85,
          sellRate: 170
        }
      ]
    },
    {
      id: 'project2',
      name: 'Mobile App Development',
      clientId: 'client2',
      budget: 75000,
      startDate: '2024-04-01',
      endDate: '2024-09-30',
      requiresApproval: false,
      roles: [
        {
          id: 'role3',
          name: 'Lead Developer',
          costRate: 80,
          sellRate: 160
        },
        {
          id: 'role4',
          name: 'UI/UX Designer',
          costRate: 70,
          sellRate: 140
        }
      ]
    }
  ]
};