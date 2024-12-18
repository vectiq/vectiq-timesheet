import { db } from './config';
import { collection, doc, setDoc, writeBatch } from 'firebase/firestore';

export async function initializeDatabase() {
  const batch = writeBatch(db);

  // Initial admin user
  const adminUser = {
    id: 'admin',
    name: 'System Admin',
    email: 'admin@example.com',
    role: 'admin',
    status: 'active',
    joinedAt: new Date().toISOString()
  };

  // Sample client
  const sampleClient = {
    id: 'client1',
    name: 'Acme Corporation',
    email: 'contact@acme.com',
    approverEmail: 'approver@acme.com'
  };

  // Sample project with roles
  const sampleProject = {
    id: 'project1',
    name: 'Website Redesign',
    clientId: 'client1',
    budget: 50000,
    startDate: '2024-03-01',
    endDate: '2024-08-31',
    requiresApproval: true,
    status: 'active'
  };

  const projectRoles = [
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

  try {
    // Create collections and documents
    await setDoc(doc(db, 'members', adminUser.id), adminUser);
    await setDoc(doc(db, 'clients', sampleClient.id), sampleClient);
    await setDoc(doc(db, 'projects', sampleProject.id), sampleProject);

    // Add project roles as a subcollection
    for (const role of projectRoles) {
      await setDoc(
        doc(db, 'projects', sampleProject.id, 'roles', role.id),
        role
      );
    }

    await batch.commit();
    console.log('Database initialized successfully');
  } catch (error) {
    console.error('Error initializing database:', error);
    throw error;
  }
}