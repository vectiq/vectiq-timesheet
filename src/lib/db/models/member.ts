import { db, query } from '../client';
import type { Member } from '@/types';

export async function getAllMembers(): Promise<Member[]> {
  const rows = await query(`
    SELECT id, name, email, role, status, joined_at
    FROM members
    ORDER BY created_at DESC
  `);

  return rows.map((row: any) => ({
    id: row.id,
    name: row.name,
    email: row.email,
    role: row.role,
    status: row.status,
    joinedAt: row.joined_at,
  }));
}

export async function createMember(member: Omit<Member, 'id'>): Promise<Member> {
  const id = crypto.randomUUID();
  
  await query(`
    INSERT INTO members (id, name, email, role, status, joined_at)
    VALUES (?, ?, ?, ?, ?, ?)
  `, [id, member.name, member.email, member.role, member.status, member.joinedAt]);

  return { id, ...member };
}