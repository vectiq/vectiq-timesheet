import { StateCreator } from 'zustand';
import type { User, ProjectAssignment } from '@/types';

export interface UsersSlice {
  users: User[];
  projectAssignments: ProjectAssignment[];
  setUsers: (users: User[] | ((prev: User[]) => User[])) => void;
  addUser: (user: User) => void;
  updateUser: (id: string, user: Partial<User>) => void;
  deleteUser: (id: string) => void;
  setProjectAssignments: (assignments: ProjectAssignment[]) => void;
  addProjectAssignment: (assignment: ProjectAssignment) => void;
  deleteProjectAssignment: (id: string) => void;
}

export const createUsersSlice: StateCreator<UsersSlice> = (set) => ({
  users: [],
  projectAssignments: [],
  setUsers: (users) => set((state) => ({ 
    users: typeof users === 'function' ? users(state.users) : users 
  })),
  addUser: (user) => set((state) => ({ users: [...state.users, user] })),
  updateUser: (id, user) => set((state) => ({
    users: state.users.map(u => u.id === id ? { ...u, ...user } : u)
  })),
  deleteUser: (id) => set((state) => ({
    users: state.users.filter(u => u.id !== id),
    projectAssignments: state.projectAssignments.filter(a => a.userId !== id)
  })),
  setProjectAssignments: (assignments) => set({ projectAssignments: assignments }),
  addProjectAssignment: (assignment) => set((state) => ({ 
    projectAssignments: [...state.projectAssignments, assignment] 
  })),
  deleteProjectAssignment: (id) => set((state) => ({
    projectAssignments: state.projectAssignments.filter(a => a.id !== id)
  })),
});