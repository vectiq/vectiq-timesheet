import { StateCreator } from 'zustand';
import type { User, ProjectAssignment } from '@/types';

export interface UsersSlice {
  users: User[];
  projectAssignments: ProjectAssignment[];
  setUsers: (users: User[]) => void;
  setProjectAssignments: (assignments: ProjectAssignment[]) => void;
}

export const createUsersSlice: StateCreator<UsersSlice> = (set) => ({
  users: [],
  projectAssignments: [],
  setUsers: (users) => set({ users }),
  setProjectAssignments: (assignments) => set({ projectAssignments: assignments }),
});