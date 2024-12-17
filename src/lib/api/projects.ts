import { Project } from '@/types';

// Simulated data for development
const mockProjects: Project[] = [
  {
    id: 'project1',
    name: 'Website Redesign',
    clientId: 'client1',
    budget: 50000,
    startDate: '2024-01-01',
    endDate: '2024-06-30',
    requiresApproval: true,
    roles: [
      {
        id: 'role1',
        name: 'Senior Developer',
        costRate: 75,
        sellRate: 150,
      },
      {
        id: 'role2',
        name: 'Project Manager',
        costRate: 85,
        sellRate: 170,
      },
    ],
  },
  {
    id: 'project2',
    name: 'Mobile App Development',
    clientId: 'client2',
    budget: 75000,
    startDate: '2024-02-01',
    endDate: '2024-08-31',
    requiresApproval: false,
    roles: [
      {
        id: 'role3',
        name: 'Lead Developer',
        costRate: 80,
        sellRate: 160,
      },
      {
        id: 'role4',
        name: 'UI/UX Designer',
        costRate: 70,
        sellRate: 140,
      },
    ],
  },
];

export const fetchProjects = async (): Promise<Project[]> => {
  await new Promise(resolve => setTimeout(resolve, 500));
  return mockProjects;
};

export const fetchProjectById = async (id: string): Promise<Project> => {
  await new Promise(resolve => setTimeout(resolve, 500));
  const project = mockProjects.find(p => p.id === id);
  if (!project) throw new Error('Project not found');
  return project;
};