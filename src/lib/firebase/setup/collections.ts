import { getFirestore } from 'firebase-admin/firestore';
import { Member, Client, Project, ProjectRole } from '@/types';

const db = getFirestore();

export async function setupMembers(adminEmail: string) {
  console.log('Setting up members collection...');
  
  const admin: Member = {
    id: 'admin',
    name: 'System Admin',
    email: adminEmail,
    role: 'admin',
    status: 'active',
    joinedAt: new Date().toISOString()
  };

  await db.collection('members').doc('admin').set(admin);
  console.log('✅ Created admin user');
}

export async function setupClients() {
  console.log('Setting up clients collection...');
  
  const client: Client = {
    id: 'client1',
    name: 'Acme Corporation',
    email: 'contact@acme.com',
    approverEmail: 'approver@acme.com'
  };

  await db.collection('clients').doc('client1').set(client);
  console.log('✅ Created sample client');
}

export async function setupProjects() {
  console.log('Setting up projects collection...');
  
  const project: Project = {
    id: 'project1',
    name: 'Website Redesign',
    clientId: 'client1',
    budget: 50000,
    startDate: '2024-03-01',
    endDate: '2024-08-31',
    requiresApproval: true,
    roles: []
  };

  const projectRef = db.collection('projects').doc('project1');
  await projectRef.set(project);

  const roles: ProjectRole[] = [
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
  ];

  for (const role of roles) {
    await projectRef.collection('roles').doc(role.id).set(role);
  }
  
  console.log('✅ Created sample project with roles');
}