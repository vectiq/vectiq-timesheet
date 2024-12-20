import { mockRoles } from './mockData';
import type { Role } from '@/types';

export async function getRoles(): Promise<Role[]> {
  await new Promise(resolve => setTimeout(resolve, 500));
  return mockRoles;
}

export async function createRole(role: Omit<Role, 'id'>): Promise<Role> {
  await new Promise(resolve => setTimeout(resolve, 500));
  const newRole = {
    ...role,
    id: `role_${Date.now()}`,
  };
  mockRoles.push(newRole);
  return newRole;
}

export async function updateRole(id: string, role: Partial<Role>): Promise<Role> {
  await new Promise(resolve => setTimeout(resolve, 500));
  const index = mockRoles.findIndex(r => r.id === id);
  if (index === -1) throw new Error('Role not found');
  
  mockRoles[index] = {
    ...mockRoles[index],
    ...role,
  };
  return mockRoles[index];
}

export async function deleteRole(id: string): Promise<void> {
  await new Promise(resolve => setTimeout(resolve, 500));
  const index = mockRoles.findIndex(r => r.id === id);
  if (index === -1) throw new Error('Role not found');
  mockRoles.splice(index, 1);
}