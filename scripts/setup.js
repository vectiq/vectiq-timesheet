import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

const initialData = {
  members: [
    {
      id: 'admin',
      name: 'System Admin',
      email: 'admin@example.com',
      role: 'admin',
      status: 'active',
      joinedAt: new Date().toISOString()
    }
  ],
  clients: [
    {
      id: 'client1',
      name: 'Acme Corporation',
      email: 'contact@acme.com',
      approverEmail: 'approver@acme.com'
    }
  ],
  projects: [
    {
      id: 'project1',
      name: 'Website Redesign',
      clientId: 'client1',
      budget: 50000,
      startDate: '2024-03-01',
      endDate: '2024-08-31',
      requiresApproval: true,
      roles: [
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
      ]
    }
  ]
};

async function setupFirebase() {
  try {
    console.log('\n🔥 Starting Firebase setup...\n');

    // Initialize Firebase Admin with service account
    initializeApp({
      credential: cert('./firebase-credentials.json'),
      projectId: 'vectiq-timesheeting'
    });
    
    const db = getFirestore();
    const batch = db.batch();

    // Create collections
    console.log('Creating collections:');

    // Members collection
    console.log('- Setting up members...');
    for (const member of initialData.members) {
      const memberRef = db.collection('members').doc(member.id);
      batch.set(memberRef, member);
    }

    // Clients collection
    console.log('- Setting up clients...');
    for (const client of initialData.clients) {
      const clientRef = db.collection('clients').doc(client.id);
      batch.set(clientRef, client);
    }

    // Projects collection with roles
    console.log('- Setting up projects and roles...');
    for (const project of initialData.projects) {
      const { roles, ...projectData } = project;
      const projectRef = db.collection('projects').doc(project.id);
      
      batch.set(projectRef, projectData);
      
      for (const role of roles) {
        const roleRef = projectRef.collection('roles').doc(role.id);
        batch.set(roleRef, role);
      }
    }

    // Commit all changes
    await batch.commit();
    console.log('✅ Database initialized\n');

    console.log(`
Next steps:
1. Sign in with the admin account:
   Email: admin@example.com
   Password: Set through Firebase Console

2. Start the development server:
   npm run dev
`);

  } catch (error) {
    console.error('\n❌ Error during setup:', error);
    process.exit(1);
  }
}

setupFirebase();