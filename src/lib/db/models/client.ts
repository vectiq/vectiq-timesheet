import { db, query } from '../client';
import type { Client } from '@/types';

export async function getAllClients(): Promise<Client[]> {
  const rows = await query(`
    SELECT id, name, email, approver_email
    FROM clients
    ORDER BY name ASC
  `);

  return rows.map((row: any) => ({
    id: row.id,
    name: row.name,
    email: row.email,
    approverEmail: row.approver_email,
  }));
}

export async function getClientById(id: string): Promise<Client | null> {
  const rows = await query(`
    SELECT id, name, email, approver_email
    FROM clients
    WHERE id = ?
  `, [id]);

  if (!rows.length) return null;

  const row = rows[0];
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    approverEmail: row.approver_email,
  };
}