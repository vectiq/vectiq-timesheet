import { create } from 'zustand';
import { UsersSlice, createUsersSlice } from './slices/users';

type StoreState = UsersSlice;

export const useStore = create<StoreState>()((set) => ({
  users: [],
  projectAssignments: [],
  


  // User actions
  setUsers: (users) => set({ users }),
  addUser: (user) => set((state) => ({ users: [...state.users, user] })),
  updateUser: (id, user) => set((state) => ({
    users: state.users.map(u => u.id === id ? { ...u, ...user } : u)
  })),
  deleteUser: (id) => set((state) => ({
    users: state.users.filter(u => u.id !== id),
    projectAssignments: state.projectAssignments.filter(a => a.userId !== id)
  })),

  // Project Assignment actions
  setProjectAssignments: (assignments) => set({ projectAssignments: assignments }),
  addProjectAssignment: (assignment) => set((state) => ({ 
    projectAssignments: [...state.projectAssignments, assignment] 
  })),
  deleteProjectAssignment: (id) => set((state) => ({
    projectAssignments: state.projectAssignments.filter(a => a.id !== id)
  })),
}));