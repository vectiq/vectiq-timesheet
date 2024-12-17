import { db } from './config';
import { collection, doc, setDoc, writeBatch } from 'firebase/firestore';

const seedData = async () => {
  const batch = writeBatch(db);

  // Seed Members
  const members = [
    {
      id: 'usr_1',
      name: 'John Doe',
      email: 'john@example.com',
      role: 'admin',
      status: 'active',
      joinedAt: new Date('2024-01-15').toISOString(),
    },
    {
      id: 'usr_2',
      name: 'Jane Smith',
      email: 'jane@example.com',
      role: 'consultant',
      status: 'active',
      joinedAt: new Date('2024-02-01').toISOString(),
    },
  ];

  // Seed Clients
  const clients = [
    {
      id: 'client_1',
      name: 'Acme Corp',
      email: 'contact@acme.com',
      approverEmail: 'approver@acme.com',
    },
    {
      id: 'client_2',
      name: 'Globex Corporation',
      email: 'contact@globex.com',
      approverEmail: 'approver@globex.com',
    },
  ];

  // Seed Projects with Roles
  const projects = [
    {
      id: 'proj_1',
      name: 'Website Redesign',
      clientId: 'client_1',
      budget: 50000,
      startDate: '2024-01-01',
      endDate: '2024-06-30',
      requiresApproval: true,
      status: 'active',
      roles: [
        {
          id: 'role_1',
          name: 'Senior Developer',
          costRate: 75,
          sellRate: 150,
        },
        {
          id: 'role_2',
          name: 'Project Manager',
          costRate: 85,
          sellRate: 170,
        },
      ],
    },
    {
      id: 'proj_2',
      name: 'Mobile App Development',
      clientId: 'client_2',
      budget: 75000,
      startDate: '2024-02-01',
      endDate: '2024-08-31',
      requiresApproval: false,
      status: 'active',
      roles: [
        {
          id: 'role_3',
          name: 'Lead Developer',
          costRate: 80,
          sellRate: 160,
        },
        {
          id: 'role_4',
          name: 'UI/UX Designer',
          costRate: 70,
          sellRate: 140,
        },
      ],
    },
  ];

  try {
    // Add members
    for (const member of members) {
      batch.set(doc(db, 'members', member.id), member);
    }

    // Add clients
    for (const client of clients) {
      batch.set(doc(db, 'clients', client.id), client);
    }

    // Add projects and their roles
    for (const project of projects) {
      const { roles, ...projectData } = project;
      batch.set(doc(db, 'projects', project.id), projectData);
      
      // Add roles as a subcollection
      for (const role of roles) {
        batch.set(
          doc(db, 'projects', project.id, 'roles', role.id),
          role
        );
      }
    }

    await batch.commit();
    console.log('Seed data written successfully');
  } catch (error) {
    console.error('Error seeding data:', error);
    throw error;
  }
};

export default seedData;