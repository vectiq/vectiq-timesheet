import {
    collection,
    doc,
    getDoc,
    writeBatch,
    getDocs,
    query,
    where,
    setDoc,
    serverTimestamp,
  } from 'firebase/firestore';
  import { getFunctions, httpsCallable } from 'firebase/functions';
  import { format } from 'date-fns';
  import { db } from '@/lib/firebase';
  import { formatTimesheetBreakdown } from '@/lib/utils/timesheet';
  import type { TimeEntry, Project, Client, Approval } from '@/types';
  
  interface ApprovalRequest {
    project: Project;
    client: Client;
    dateRange: {
      start: Date;
      end: Date;
    };
    entries: TimeEntry[];
    userId: string;
  }
  
  export async function submitTimesheetApproval(request: ApprovalRequest) {
    const { project, client, dateRange, entries, userId } = request;
    
    // Generate composite approval key
    const approvalKey = `${project.id}_${format(dateRange.start, 'yyyy-MM-dd')}_${format(dateRange.end, 'yyyy-MM-dd')}_${userId}`;
    
    // Try to get existing approval
    const approvalRef = doc(db, 'approvals', approvalKey);
    const existingApproval = await getDoc(approvalRef);
  
    if (existingApproval.exists()) {
      throw new Error('Time entries for this period have already been submitted for approval');
    }
  
    // Calculate total hours
    const totalHours = entries.reduce((sum, entry) => sum + entry.hours, 0);
  
    // Create approval document with composite key
    const approvalDoc: Approval = {
      id: approvalKey,
      approvalKey,
      status: 'pending',
      submittedAt: new Date(),
      project,
      client,
      period: {
        startDate: format(dateRange.start, 'yyyy-MM-dd'),
        endDate: format(dateRange.end, 'yyyy-MM-dd')
      },
      totalHours,
      entries,
      approverEmail: project.approverEmail,
      userId,
    };
  
    // Save approval document
    await setDoc(approvalRef, approvalDoc);
  
    // Update time entries with approval key
    const batch = writeBatch(db);
    entries.forEach(entry => {
      const entryRef = doc(db, 'timeEntries', entry.id);
      batch.update(entryRef, { approvalKey });
    });
    await batch.commit();
  
    // Generate approval URLs
    const baseUrl = import.meta.env.VITE_FIREBASE_API_URL;
    const approveUrl = `${baseUrl}/api/timesheetApproval?id=${approvalKey}&action=approve`;
    const rejectUrl = `${baseUrl}/api/timesheetApproval?id=${approvalKey}&action=reject`;
  
    // Format dates for email
    const startDate = format(dateRange.start, 'MMM d, yyyy');
    const endDate = format(dateRange.end, 'MMM d, yyyy');
  
    // Fetch roles for the entries
    const roleIds = [...new Set(entries.map(entry => entry.roleId))];
    const rolesSnapshot = await getDocs(
      query(collection(db, 'roles'), where('id', 'in', roleIds))
    );
    const roles = rolesSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  
    // Generate timesheet breakdown table
    const timesheetTable = formatTimesheetBreakdown(entries, roles.map(role => ({
      id: role.id,
      name: role.name
    })));
  
    // Prepare email content
    const emailHtml = `
      <h2>Timesheet Approval Request</h2>
      <p>A timesheet has been submitted for your approval:</p>
      
      <ul>
        <li><strong>Client:</strong> ${client.name}</li>
        <li><strong>Project:</strong> ${project.name}</li>
        <li><strong>Period:</strong> ${startDate} - ${endDate}</li>
        <li><strong>Total Hours:</strong> ${totalHours.toFixed(2)}</li>
      </ul>
  
      <h3 style="margin-top: 24px;">Time Entry Details</h3>
      
      ${timesheetTable}
  
      <div style="margin: 30px 0;">
        <a href="${approveUrl}" style="background: #22c55e; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin-right: 12px;">
          Approve Timesheet
        </a>
        <a href="${rejectUrl}" style="background: #ef4444; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px;">
          Reject Timesheet
        </a>
      </div>
  
      <p style="color: #666; font-size: 14px;">
        If the buttons don't work, you can copy and paste these links into your browser:
        <br>Approve: ${approveUrl}
        <br>Reject: ${rejectUrl}
      </p>
    `;
  
    // Send approval email
    const functions = getFunctions();
    const sendEmail = httpsCallable(functions, 'sendApprovalEmail');
    await sendEmail({
      recipient: project.approverEmail,
      subject: `Timesheet Approval Required: ${client.name} - ${project.name}`,
      body: emailHtml,
      type: 'Timesheet approval'
    });
  
    return approvalKey;
  }