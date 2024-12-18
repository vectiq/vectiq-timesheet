import { initializeApp } from 'firebase-admin/app';
import { setupMembers, setupClients, setupProjects } from '../src/lib/firebase/setup/collections';
import { setupIndexes } from '../src/lib/firebase/setup/indexes';

async function setupFirebase() {
  try {
    console.log('🔥 Starting Firebase setup...');
    
    // Initialize Firebase Admin
    initializeApp();

    // Setup collections
    await setupMembers(process.env.ADMIN_EMAIL || 'admin@example.com');
    await setupClients();
    await setupProjects();

    // Setup indexes
    await setupIndexes();

    console.log('\n🎉 Firebase setup completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Error during Firebase setup:', error);
    process.exit(1);
  }
}

setupFirebase();