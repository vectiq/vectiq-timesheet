import { readFileSync } from 'fs';
import { join } from 'path';
import { db } from '../src/lib/db/client';

async function seed() {
  try {
    console.log('Starting database seeding...');
    
    const seedPath = join(process.cwd(), 'src/lib/db/seeds/001_initial_data.sql');
    const seedSQL = readFileSync(seedPath, 'utf8');
    
    await db.execute(seedSQL);
    
    console.log('Seeding completed successfully!');
  } catch (error) {
    console.error('Seeding failed:', error);
    process.exit(1);
  }
}

seed();