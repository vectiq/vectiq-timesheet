import { readFileSync } from 'fs';
import { join } from 'path';
import { db } from '../src/lib/db/client';

async function migrate() {
  try {
    console.log('Starting database migration...');
    
    const migrationPath = join(process.cwd(), 'src/lib/db/migrations/001_initial_schema.sql');
    const migration = readFileSync(migrationPath, 'utf8');
    
    await db.execute(migration);
    
    console.log('Migration completed successfully!');
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
}

migrate();