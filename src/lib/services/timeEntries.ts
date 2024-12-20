import { mockTimeEntries } from './mockData';
import type { TimeEntry } from '@/types';

export async function getTimeEntries(): Promise<TimeEntry[]> {
  await new Promise(resolve => setTimeout(resolve, 500));
  return mockTimeEntries;
}

export async function createTimeEntry(entry: Omit<TimeEntry, 'id'>): Promise<TimeEntry> {
  await new Promise(resolve => setTimeout(resolve, 500));
  const newEntry = {
    ...entry,
    id: `entry_${Date.now()}`,
  };
  mockTimeEntries.push(newEntry);
  return newEntry;
}