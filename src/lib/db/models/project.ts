import { db, query } from '../client';
import type { Project, ProjectRole } from '@/types';

export async function getAllProjects(): Promise<Project[]> {
  const projects = await query(`
    SELECT p.*, json_group_array(
      json_object(
        'id', pr.id,
        'name', pr.name,
        'costRate', pr.cost_rate,
        'sellRate', pr.sell_rate
      )
    ) as roles
    FROM projects p
    LEFT JOIN project_roles pr ON p.id = pr.project_id
    GROUP BY p.id
    ORDER BY p.created_at DESC
  `);

  return projects.map((row: any) => ({
    id: row.id,
    name: row.name,
    clientId: row.client_id,
    budget: parseFloat(row.budget),
    startDate: row.start_date,
    endDate: row.end_date,
    requiresApproval: Boolean(row.requires_approval),
    roles: JSON.parse(row.roles),
  }));
}

export async function createProject(project: Omit<Project, 'id'>): Promise<Project> {
  const id = crypto.randomUUID();
  
  await db.transaction(async (tx) => {
    await tx.execute(`
      INSERT INTO projects (id, name, client_id, budget, start_date, end_date, requires_approval)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `, [id, project.name, project.clientId, project.budget, project.startDate, project.endDate, project.requiresApproval]);

    for (const role of project.roles) {
      const roleId = crypto.randomUUID();
      await tx.execute(`
        INSERT INTO project_roles (id, project_id, name, cost_rate, sell_rate)
        VALUES (?, ?, ?, ?, ?)
      `, [roleId, id, role.name, role.costRate, role.sellRate]);
    }
  });

  return { id, ...project };
}