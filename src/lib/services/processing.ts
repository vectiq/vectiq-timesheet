import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { format } from 'date-fns';
import type { ProcessingData, ProcessingProject } from '@/types';

export async function getProcessingData(month: string): Promise<ProcessingData> {
  // Get all required data
  const [timeEntriesSnapshot, approvalsSnapshot, projectsSnapshot, clientsSnapshot, usersSnapshot] = await Promise.all([
    getDocs(query(
      collection(db, 'timeEntries'),
      where('date', '>=', `${month}-01`), 
      where('date', '<=', `${month}-31`)
    )),
    getDocs(collection(db, 'approvals')),
    getDocs(collection(db, 'projects')),
    getDocs(collection(db, 'clients')),
    getDocs(collection(db, 'users'))
  ]);

  // Create maps for quick lookups
  const clients = new Map(clientsSnapshot.docs.map(doc => [doc.id, { id: doc.id, ...doc.data() }]));
  const users = new Map(usersSnapshot.docs.map(doc => [doc.id, { id: doc.id, ...doc.data() }]));

  // Process projects with their statuses
  const projects = projectsSnapshot.docs.map(doc => {
    const projectData = doc.data();
    const project = { 
      id: doc.id, 
      ...projectData,
      roles: projectData.roles || []
    };
    const client = clients.get(project.clientId);

    // Get time entries for this project
    const timeEntries = timeEntriesSnapshot.docs
      .filter(doc => doc.data().projectId === project.id)
      .map(doc => ({ id: doc.id, ...doc.data() }));

    // Get all users assigned to this project through their projectAssignments
    const assignments = [];
    for (const [userId, user] of users) {
      // Ensure we're accessing the projectAssignments from the user data correctly
      const userData = user as any;
      const projectAssignments = userData.projectAssignments || [];
      const projectAssignment = projectAssignments.find(a => a.projectId === project.id);
      
      if (projectAssignment) {
        const role = project.roles.find(r => r.id === projectAssignment.roleId);
        if (!role) continue;

        const userEntries = timeEntries.filter(entry => entry.userId === userId);
        const hours = userEntries.reduce((sum, entry) => sum + (entry.hours || 0), 0);

        assignments.push({
          userId,
          userName: userData.name || 'Unknown User',
          roleId: role.id,
          roleName: role.name,
          hours
        });
      }
    }

    const totalHours = timeEntries.reduce((sum, entry) => sum + (entry.hours || 0), 0);
    
    // Get latest approval for this project
    const approvals = approvalsSnapshot.docs
      .filter(doc => doc.data().project?.id === project.id)
      .map(doc => ({ id: doc.id, ...doc.data() }))
      .sort((a, b) => b.submittedAt - a.submittedAt);

    const latestApproval = approvals[0];

    return {
      id: project.id,
      name: project.name,
      clientId: project.clientId,
      clientName: client?.name || 'Unknown Client',
      totalHours,
      timesheetStatus: latestApproval?.status || 'pending',
      invoiceStatus: 'not started',
      priority: totalHours > 100 ? 'high' : 'normal',
      hasSpecialHandling: project.requiresApproval,
      type: assignments.length === 1 ? 'labor_hire' : 'team',
      assignments
    } as ProcessingProject;
  });

  // Calculate summary stats
  const summary = {
    totalProjects: projects.length,
    approvedTimesheets: projects.filter(p => p.timesheetStatus === 'approved').length,
    generatedInvoices: projects.filter(p => p.invoiceStatus === 'generated').length,
    urgentItems: projects.filter(p => p.priority === 'high').length
  };

  return {
    projects,
    summary
  };
}