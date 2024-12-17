import { db, query } from '../client';
import type { TimeEntry } from '@/types';

export async function getTimeEntriesByUserId(userId: string): Promise<TimeEntry[]> {
  const rows = await query(`
    SELECT id, user_id, project_id, project_role_id, date,
           hours, description, status, submitted_at, approved_at
    FROM time_entries
    WHERE user_id = ?
    ORDER BY date DESC
  `, [userId]);

  return rows.map((row: any) => ({
    id: row.id,
    userId: row.user_id,
    projectId: row.project_id,
    projectRoleId: row.project_role_id,
    date: row.date,
    hours: parseFloat(row.hours),
    description: row.description,
    status: row.status,
    submittedAt: row.submitted_at,
    approvedAt: row.approved_at,
  }));
}

export async function createTimeEntry(entry: Omit<TimeEntry, 'id'>): Promise<TimeEntry> {
  const id = crypto.randomUUID();
  
  await query(`
    INSERT INTO time_entries (
      id, user_id, project_id, project_role_id, date,
      hours, description, status, submitted_at, approved_at
    )
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `, [
    id,
    entry.userId,
    entry.projectId,
    entry.projectRoleId,
    entry.date,
    entry.hours,
    entry.description,
    entry.status,
    entry.submittedAt,
    entry.approvedAt,
  ]);

  return { id, ...entry };
}