import { create } from 'zustand';
import { RolesSlice, createRolesSlice } from './slices/roles';
import { ProjectsSlice, createProjectsSlice } from './slices/projects';
import { ClientsSlice, createClientsSlice } from './slices/clients';
import { TimeEntriesSlice, createTimeEntriesSlice } from './slices/timeEntries';
import { UsersSlice, createUsersSlice } from './slices/users';
import { 
  mockRoles, 
  mockProjects, 
  mockClients, 
  mockTimeEntries 
} from '../services/mockData';

type StoreState = RolesSlice & ProjectsSlice & ClientsSlice & TimeEntriesSlice & UsersSlice;

export const useStore = create<StoreState>()((set) => ({
  // Initialize with mock data
  roles: mockRoles,
  projects: mockProjects,
  clients: mockClients,
  timeEntries: mockTimeEntries,
  users: [],
  projectAssignments: [],
  
  // Role actions
  setRoles: (roles) => set({ roles }),
  addRole: (role) => set((state) => ({ roles: [...state.roles, role] })),
  updateRole: (id, role) => set((state) => ({
    roles: state.roles.map(r => r.id === id ? { ...r, ...role } : r)
  })),
  deleteRole: (id) => set((state) => ({
    roles: state.roles.filter(r => r.id !== id)
  })),

  // Project actions
  setProjects: (projects) => set({ projects }),
  addProject: (project) => set((state) => ({ projects: [...state.projects, project] })),
  updateProject: (id, project) => set((state) => ({
    projects: state.projects.map(p => p.id === id ? { ...p, ...project } : p)
  })),
  deleteProject: (id) => set((state) => ({
    projects: state.projects.filter(p => p.id !== id)
  })),

  // Client actions
  setClients: (clients) => set({ clients }),
  addClient: (client) => set((state) => ({ clients: [...state.clients, client] })),
  updateClient: (id, client) => set((state) => ({
    clients: state.clients.map(c => c.id === id ? { ...c, ...client } : c)
  })),
  deleteClient: (id) => set((state) => ({
    clients: state.clients.filter(c => c.id !== id)
  })),

  // Time entry actions
  setTimeEntries: (entries) => set({ timeEntries: entries }),
  addTimeEntry: (entry) => set((state) => ({ timeEntries: [...state.timeEntries, entry] })),
  updateTimeEntry: (id, entry) => set((state) => ({
    timeEntries: state.timeEntries.map(e => e.id === id ? { ...e, ...entry } : e)
  })),
  deleteTimeEntry: (id) => set((state) => ({
    timeEntries: state.timeEntries.filter(e => e.id !== id)
  })),

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