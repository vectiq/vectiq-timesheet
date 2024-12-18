import { getFirestore } from 'firebase-admin/firestore';
import { readFileSync } from 'fs';
import { join } from 'path';

const db = getFirestore();

export async function setupIndexes() {
  console.log('Setting up Firestore indexes...');
  
  const indexes = JSON.parse(
    readFileSync(join(process.cwd(), 'firestore.indexes.json'), 'utf8')
  );
  
  for (const index of indexes.indexes) {
    await db.collection(index.collectionGroup).listIndexes();
    console.log(`✅ Created index for ${index.collectionGroup}`);
  }
}