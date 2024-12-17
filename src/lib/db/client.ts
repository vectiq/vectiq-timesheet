import { createClient } from '@libsql/client';

export const db = createClient({
  url: process.env.DATABASE_URL || 'file:local.db',
});

export async function query(sql: string, params: any[] = []) {
  try {
    const result = await db.execute(sql, params);
    return result.rows;
  } catch (error) {
    console.error('Database query error:', error);
    throw error;
  }
}