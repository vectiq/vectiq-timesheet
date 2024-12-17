import { TimeEntry } from '@/types';

// Simulated data for development
const mockTimeEntries: TimeEntry[] = [
  {
    id: '1',
    userId: 'user1',
    projectId: 'project1',
    projectRoleId: 'role1',
    date: '2024-03-18',
    hours: 8,
    description: 'Frontend development',
    status: 'pending',
    submittedAt: '2024-03-18T17:00:00Z',
  },
  {
    id: '2',
    userId: 'user1',
    projectId: 'project2',
    projectRoleId: 'role3',
    date: '2024-03-19',
    hours: 6.5,
    description: 'API integration',
    status: 'approved',
    submittedAt: '2024-03-19T15:30:00Z',
    approvedAt: '2024-03-20T09:00:00Z',
  },
];

export const fetchTimeEntries = async (): Promise<TimeEntry[]> => {
  await new Promise(resolve => setTimeout(resolve, 500));
  return mockTimeEntries;
};

export const createTimeEntry = async (data: TimeEntry): Promise<TimeEntry> => {
  await new Promise(resolve => setTimeout(resolve, 500));
  mockTimeEntries.push(data);
  return data;
};

export const updateTimeEntry = async (id: string, data: Partial<TimeEntry>): Promise<TimeEntry> => {
  await new Promise(resolve => setTimeout(resolve, 500));
  const index = mockTimeEntries.findIndex(entry => entry.id === id);
  if (index === -1) throw new Error('Time entry not found');
  
  mockTimeEntries[index] = { ...mockTimeEntries[index], ...data };
  return mockTimeEntries[index];
};