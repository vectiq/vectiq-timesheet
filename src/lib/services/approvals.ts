import {
  collection,
  doc,
  getDoc,
  updateDoc,
  writeBatch,
  getDocs,
  query,
  where,
  setDoc,
  serverTimestamp,
  orderBy,
  limit,
} from 'firebase/firestore';
import { getFunctions, httpsCallable } from 'firebase/functions';
import { format } from 'date-fns';
import { db } from '@/lib/firebase';
import { formatTimesheetBreakdown } from '@/lib/utils/timesheet';
import type { TimeEntry, Project, Client, Approval, ApprovalStatus } from '@/types';
import CryptoJS from 'crypto-js';

export async function getApprovalsForDate(
  date: string,
  userId: string,
  projectId: string
): Promise<Approval[]> {
  // Get first day of week and month for the given date
  const dateObj = new Date(date);
  const firstDayOfWeek = new Date(dateObj);
  firstDayOfWeek.setDate(dateObj.getDate() - dateObj.getDay() + 1);
  const firstDayOfMonth = new Date(dateObj.getFullYear(), dateObj.getMonth(), 1);

  const weekStart = format(firstDayOfWeek, 'yyyy-MM-dd');
  const monthStart = format(firstDayOfMonth, 'yyyy-MM-dd');

  const approvalsRef = collection(db, 'approvals');
  const q = query(
    approvalsRef,
    where('userId', '==', userId),
    where('project.id', '==', projectId),
    where('period.startDate', 'in', [weekStart, monthStart]),
    where('status', 'in', ['pending', 'approved'])
  );

  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({
    ...doc.data(),
    id: doc.id,
    submittedAt: doc.data().submittedAt?.toDate(),
    approvedAt: doc.data().approvedAt?.toDate(),
    rejectedAt: doc.data().rejectedAt?.toDate(),
    withdrawnAt: doc.data().withdrawnAt?.toDate(),
  })) as Approval[];
}

export async function withdrawApproval(approvalId: string) {
  const approvalRef = doc(db, 'approvals', approvalId);
  await updateDoc(approvalRef, {
    status: 'withdrawn',
    withdrawnAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  });
}

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

  // Generate composite key for querying
  const compositeKey = `${project.id}_${format(dateRange.start, 'yyyy-MM-dd')}_${format(dateRange.end, 'yyyy-MM-dd')}_${userId}`;

  // Generate unique approval ID
  const approvalId = crypto.randomUUID();

  // Check for existing active approvals
  const existingApprovalsSnapshot = await getDocs(
    query(
      collection(db, 'approvals'),
      where('compositeKey', '==', compositeKey),
      where('status', 'in', ['pending', 'approved'])
    )
  );

  if (!existingApprovalsSnapshot.empty) {
    throw new Error('Time entries for this period have already been submitted for approval');
  }

  // Calculate total hours
  const totalHours = entries.reduce((sum, entry) => sum + entry.hours, 0);

  // Create approval document
  const approvalDoc: Approval = {
    id: approvalId,
    compositeKey,
    status: 'pending',
    submittedAt: new Date(),
    project,
    client,
    period: {
      startDate: format(dateRange.start, 'yyyy-MM-dd'),
      endDate: format(dateRange.end, 'yyyy-MM-dd')
    },
    totalHours,
    userId,
    approverEmail: project.approverEmail,
  };

  // Save approval document
  await setDoc(doc(db, 'approvals', approvalId), approvalDoc);

  // Generate approval URLs
  const baseUrl = import.meta.env.VITE_FIREBASE_API_URL;
  const rejectUrl = import.meta.env.VITE_APP_URL + '/reject?id=' + approvalId;
  const approveUrl = `${baseUrl}/approveTimesheet?id=${approvalId}&action=approve`;

  // Format dates for email
  const startDate = format(dateRange.start, 'MMM d, yyyy');
  const endDate = format(dateRange.end, 'MMM d, yyyy');

  // Get tasks from project
  const tasks = project.tasks.map(task => ({
    id: task.id,
    name: task.name
  }));

  // Generate timesheet breakdown table
  const timesheetTable = formatTimesheetBreakdown(entries, tasks.map(task => ({
    id: task.id,
    name: task.name
  })));

  // Get user details
  const userRef = doc(db, 'users', userId);
  const userDoc = await getDoc(userRef);

  if (!userDoc.exists()) {
    throw new Error('User not found');
  }

  const user = userDoc.data();

  // Prepare email content
  const emailHtml = `
      <h2>Timesheet Approval Request</h2>
      <p>A timesheet has been submitted for your approval by ${user.name}:</p>
      
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
  const sendEmail = httpsCallable(functions, 'sendEmail');
  await sendEmail({
    recipient: project.approverEmail,
    subject: `Timesheet Approval Required: ${client.name} - ${project.name} (Submitted by ${user.name})`,
    body: emailHtml,
    type: 'Timesheet approval',
    token: generateToken(import.meta.env.VITE_EMAIL_SECRET)
  });

  return approvalId;
}

function generateToken(secret) {
  const timestamp = Date.now().toString();
  const data = `${timestamp}:${secret}`;
  const hash = CryptoJS.SHA256(data).toString(CryptoJS.enc.Hex);
  return `${hash}:${timestamp}`;
}

export async function getApprovals(): Promise<Approval[]> {
  const snapshot = await getDocs(
    collection(db, 'approvals')
  );

  const approvals = snapshot.docs.map(doc => ({
    ...doc.data(),
    id: doc.id,
    submittedAt: doc.data().submittedAt?.toDate(),
    approvedAt: doc.data().approvedAt?.toDate(),
    rejectedAt: doc.data().rejectedAt?.toDate(),
    withdrawnAt: doc.data().withdrawnAt?.toDate(),
  })) as Approval[];

  return approvals;
}

export async function getApprovalStatus(
  projectId: string,
  userId: string,
  startDate: string,
  endDate: string
): Promise<ApprovalStatus | null> {
  const approvalsRef = collection(db, 'approvals');
  const q = query(
    approvalsRef,
    where('project.id', '==', projectId),
    where('userId', '==', userId),
    where('period.startDate', '==', startDate),
    where('period.endDate', '==', endDate),
    limit(1)
  );

  const snapshot = await getDocs(q);
  if (snapshot.empty) return null;

  const approval = snapshot.docs[0].data() as Approval;
  console.log("Approval", approval)
  return {
    status: approval.status,
    approvalId: approval.id
  };
}

export async function rejectTimesheet(approval) {
  const approvalRef = doc(db, 'approvals', approval.id);
  await updateDoc(approvalRef, {
    status: 'rejected',
    rejectionReason: approval.comments,
    rejectedAt: new Date(),
  });

  // Get user details
  const userRef = doc(db, 'users', approval.userId);
  const userDoc = await getDoc(userRef);

  if (!userDoc.exists()) {
    throw new Error('User not found');
  }

  const user = userDoc.data();
  const startDate = format(new Date(approval.period.startDate), 'MMM d, yyyy');
  const endDate = format(new Date(approval.period.endDate), 'MMM d, yyyy');

  // Prepare rejection email
  const emailHtml = `
      <h2>Timesheet Rejected</h2>
      <p>Your timesheet has been rejected for the following period:</p>
      
      <ul>
        <li><strong>Client:</strong> ${approval.client.name}</li>
        <li><strong>Project:</strong> ${approval.project.name}</li>
        <li><strong>Period:</strong> ${startDate} - ${endDate}</li>
        <li><strong>Total Hours:</strong> ${approval.totalHours.toFixed(2)}</li>
      </ul>

      <div style="margin: 24px 0; padding: 16px; background: #fef2f2; border: 1px solid #fee2e2; border-radius: 6px;">
        <h3 style="margin: 0 0 8px 0; color: #991b1b;">Rejection Reason:</h3>
        <p style="margin: 0; color: #991b1b;">${approval.comments}</p>
      </div>

      <p>Please review the feedback and submit an updated timesheet.</p>
    `;

  // Send rejection email
  const functions = getFunctions();
  const sendEmail = httpsCallable(functions, 'sendEmail');
  await sendEmail({
    recipient: user.email,
    subject: `Timesheet Rejected: ${approval.client.name} - ${approval.project.name}`,
    body: emailHtml,
    type: 'Timesheet rejection',
    token: generateToken(import.meta.env.VITE_EMAIL_SECRET)
  });
}