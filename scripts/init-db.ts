import { initializeApp, cert } from 'firebase-admin/app';
import { initializeDatabase } from '../src/lib/firebase/initializeDatabase';

async function main() {
  try {
    // Initialize Firebase Admin with default credentials
    initializeApp();
    
    console.log('🔥 Initializing database...');
    await initializeDatabase();
    console.log('✅ Database initialization completed successfully');
    process.exit(0);
  } catch (error) {
    console.error('❌ Database initialization failed:', error);
    process.exit(1);
  }
}