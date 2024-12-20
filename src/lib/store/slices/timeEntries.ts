import { StateCreator } from 'zustand';
import type { TimeEntry } from '@/types';

export interface TimeEntriesSlice {
  timeEntries: TimeEntry[];
  setTimeEntries: (entries: TimeEntry[]) => void;
  addTimeEntry: (entry: TimeEntry) => void;
  updateTimeEntry: (id: string, entry: Partial<TimeEntry>) => void;
  deleteTimeEntry: (id: string) => void;
}

export const createTimeEntriesSlice: StateCreator<TimeEntriesSlice> = (set, get, store, initialEntries: TimeEntry[] = []) => ({
  timeEntries: initialEntries,
  setTimeEntries: (entries) => set({ timeEntries: entries }),
  addTimeEntry: (entry) => set((state) => ({ timeEntries: [...state.timeEntries, entry] })),
  updateTimeEntry: (id, entry) => set((state) => ({
    timeEntries: state.timeEntries.map(e => e.id === id ? { ...e, ...entry } : e)
  })),
  deleteTimeEntry: (id) => set((state) => ({
    timeEntries: state.timeEntries.filter(e => e.id !== id)
  })),
});