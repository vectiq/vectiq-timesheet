import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { initialData } from '../src/lib/firebase/setup/types';

async function setupDatabase() {
  try {
    console.log('🔥 Initializing Firebase Admin...');
    initializeApp();
    
    const db = getFirestore();
    const batch = db.batch();

    console.log('📝 Creating collections and documents...');

    // Create members
    for (const member of initialData.members) {
      const memberRef = db.collection('members').doc(member.id);
      batch.set(memberRef, member);
    }

    // Create clients
    for (const client of initialData.clients) {
      const clientRef = db.collection('clients').doc(client.id);
      batch.set(clientRef, client);
    }

    // Create projects and their roles
    for (const project of initialData.projects) {
      const { roles, ...projectData } = project;
      const projectRef = db.collection('projects').doc(project.id);
      
      // Set project document
      batch.set(projectRef, projectData);
      
      // Create roles subcollection
      for (const role of roles) {
        const roleRef = projectRef.collection('roles').doc(role.id);
        batch.set(roleRef, role);
      }
    }

    console.log('💾 Committing batch write...');
    await batch.commit();

    console.log('✅ Database setup completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error setting up database:', error);
    process.exit(1);
  }
}

setupDatabase();