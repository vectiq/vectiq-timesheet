import { initializeApp } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { initialData } from '../src/lib/firebase/setup/types';

async function setupFirebase() {
  try {
    console.log('\n🔥 Starting Firebase setup...\n');

    // Initialize Firebase Admin
    initializeApp();
    const db = getFirestore();
    const batch = db.batch();

    // Create collections and documents
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

    console.log('Committing database changes...');
    await batch.commit();
    console.log('✅ Database initialized\n');

    console.log('🚀 Setup completed successfully!\n');

    console.log(`
Next steps:
1. Sign in with the admin account:
   Email: admin@example.com
   (Set password through Firebase Console)

2. Start the development server:
   npm run dev

3. Start Firebase emulators (optional):
   npm run emulators
`);

    process.exit(0);
  } catch (error) {
    console.error('\n❌ Error during setup:', error);
    process.exit(1);
  }
}

setupFirebase();