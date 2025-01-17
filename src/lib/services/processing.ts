import { collection, getDocs, query, where, doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { format } from 'date-fns';
import type { ProcessingData, ProcessingProject, TimeEntry, Approval } from '@/types';

interface ProjectStatus {
  projectId: string;
  month: string;
  status: 'not started' | 'draft' | 'sent';
  updatedAt: any;
}

export async function updateProjectStatus(
  projectId: string,
  month: string,
  status: 'not started' | 'draft' | 'sent'
): Promise<void> {
  const statusId = `${projectId}_${month}`;
  const statusRef = doc(db, 'projectStatuses', statusId);
  
  await setDoc(statusRef, {
    projectId,
    month,
    status,
    updatedAt: serverTimestamp()
  });
}

export async function getProcessingData(month: string): Promise<ProcessingData> {
  // Get start and end dates for the month
  const startDate = `${month}-01`;
  const endDate = `${month}-31`;

  // Fetch all required data in parallel
  const [timeEntriesSnapshot, projectsSnapshot, clientsSnapshot, usersSnapshot, approvalsSnapshot, statusesSnapshot] = 
    await Promise.all([
      // Get time entries for the month
      getDocs(query(
        collection(db, 'timeEntries'),
        where('date', '>=', startDate),
        where('date', '<=', endDate)
      )),
      getDocs(collection(db, 'projects')),
      getDocs(collection(db, 'clients')),
      getDocs(collection(db, 'users')),
      // Get approvals for the month
      getDocs(query(
        collection(db, 'approvals'),
        where('startDate', '==', startDate),
        where('endDate', '==', endDate)
      )),
      getDocs(collection(db, 'projectStatuses'))
    ]);

  // Create lookup maps
  const clients = new Map(clientsSnapshot.docs.map(doc => [doc.id, { id: doc.id, ...doc.data() }]));
  const users = new Map(usersSnapshot.docs.map(doc => [doc.id, { id: doc.id, ...doc.data() }]));
  const projects = new Map(projectsSnapshot.docs.map(doc => [doc.id, { id: doc.id, ...doc.data() }]));
  
  // Create map of project statuses for the month
  const statusMap = new Map();
  statusesSnapshot.docs.forEach(doc => {
    const status = doc.data() as ProjectStatus;
    if (status.month === month) {
      statusMap.set(status.projectId, status.status);
    }
  });

  // Create map of approvals by project and user
  const approvalMap = new Map();
  approvalsSnapshot.docs.forEach(doc => {
    const approval = doc.data() as Approval;
    const key = `${approval.project?.id}_${approval.userId}`;
    approvalMap.set(key, approval);
  });

  // Get time entries and group by project
  const timeEntries = timeEntriesSnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  })) as TimeEntry[];

  // Group time entries by project
  const entriesByProject = new Map<string, TimeEntry[]>();
  timeEntries.forEach(entry => {
    const entries = entriesByProject.get(entry.projectId) || [];
    entries.push(entry);
    entriesByProject.set(entry.projectId, entries);
  });

  // Process each project that has time entries
  const processedProjects = Array.from(projects.values())
    .filter(project => entriesByProject.has(project.id))
    .map(project => {
      const client = clients.get(project.clientId);
      const projectEntries = entriesByProject.get(project.id) || [];
      const projectData = projects.get(project.id);

      // Group entries by user and task
      const assignmentMap = new Map<string, {
        userId: string;
        userName: string;
        taskId: string;
        taskName: string;
        hours: number;
        approvalStatus: string;
      }>();

      projectEntries.forEach(entry => {
        const user = users.get(entry.userId);
        const task = project.tasks?.find(t => t.id === entry.taskId);
        
        if (!user || !task) return;

        // Get approval status for this user's entries
        const approvalKey = `${project.id}_${user.id}`;
        const approval = approvalMap.get(approvalKey);
        
        // Determine approval status based on project settings
        let approvalStatus = 'No Approval Required';
        if (projectData?.requiresApproval) {
          approvalStatus = approval ? approval.status : 'unsubmitted';
        }
        
        const key = `${entry.userId}-${entry.taskId}`;
        const existing = assignmentMap.get(key);

        if (existing) {
          existing.hours += entry.hours;
        } else {
          assignmentMap.set(key, {
            userId: user.id,
            userName: user.name,
            taskId: task.id,
            taskName: task.name,
            hours: entry.hours,
            approvalStatus
          });
        }
      });

      // Get assignments and total hours
      const assignments = Array.from(assignmentMap.values());
      const totalHours = assignments.reduce((sum, a) => sum + a.hours, 0);

      return {
        id: project.id,
        name: project.name,
        clientId: project.clientId,
        clientName: client?.name || 'Unknown Client',
        totalHours,
        requiresApproval: projectData?.requiresApproval || false,
        invoiceStatus: statusMap.get(project.id) || 'not started',
        priority: totalHours > 100 ? 'high' : 'normal',
        hasSpecialHandling: project.requiresApproval,
        type: assignments.length === 1 ? 'labor_hire' : 'team',
        assignments
      } as ProcessingProject;
    });

  // Calculate summary statistics
  const summary = {
    totalProjects: processedProjects.length,
    approvedTimesheets: processedProjects.reduce((count, project) => {
      // Only count projects that require approval
      if (!project.requiresApproval) return count;
      
      // Count total assignments requiring approval
      const totalAssignments = project.assignments.length;
      
      // Count approved assignments
      const approvedAssignments = project.assignments.filter(
        a => a.approvalStatus === 'approved'
      ).length;
      
      // Only increment if all assignments are approved
      return count + (totalAssignments === approvedAssignments ? 1 : 0);
    }, 0),
    totalRequiringApproval: processedProjects.filter(p => p.requiresApproval).length,
    generatedInvoices: processedProjects.filter(p => p.invoiceStatus === 'sent').length,
    urgentItems: processedProjects.filter(p => p.priority === 'high').length
  };

  return {
    projects: processedProjects,
    summary
  };
}