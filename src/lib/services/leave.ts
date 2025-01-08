import { 
    collection,
    doc,
    getDocs, 
    getDoc,
    setDoc,
    deleteDoc,
    serverTimestamp,
    query,
    where,
  } from 'firebase/firestore';
  import { getFunctions, httpsCallable } from 'firebase/functions';
  import { db } from '@/lib/firebase';
  import { auth } from '@/lib/firebase';
  import type { Leave } from '@/types';
  
  const COLLECTION = 'employeeLeave';
  const functions = getFunctions();
  
  // Get leave requests from Xero and sync to Firestore
  export async function getLeave(): Promise<Leave[]> {
    const userId = auth.currentUser?.uid;
    if (!userId) return [];
    
    // Get user's Xero employee ID
    const userRef = doc(db, 'users', userId);
    const userDoc = await getDoc(userRef);
    if (!userDoc.exists() || !userDoc.data().xeroEmployeeId) {
      throw new Error('User not found or no Xero Employee ID set');
    }
    const xeroEmployeeId = userDoc.data().xeroEmployeeId;

    // Get tenant ID from Firestore
    const tenantRef = doc(db, 'config', 'xero_config');
    const tenantDoc = await getDoc(tenantRef);
    if (!tenantDoc.exists() || !tenantDoc.data().tenantId) {
      throw new Error('Xero tenant ID not found');
    }
  
    // Get leave from Xero
    const getXeroLeave = httpsCallable(functions, 'getLeave');
    const xeroResponse = await getXeroLeave({ employeeId: xeroEmployeeId, tenantId: tenantDoc.data().tenantId });
    const xeroLeave = xeroResponse.data;
  
    // Sync with Firestore
    const employeeLeaveRef = doc(db, COLLECTION, userId);
    await setDoc(employeeLeaveRef, {
      userId,
      leave: xeroLeave,
      updatedAt: serverTimestamp()
    }, { merge: true });
  
    return xeroLeave;
  }
  
  export async function createLeave(leaveData: Omit<Leave, 'id' | 'status' | 'xeroLeaveId'>): Promise<Leave> {
    const userId = auth.currentUser?.uid;
    if (!userId) throw new Error('User not authenticated');
    
    // Get user's Xero employee ID
    const userRef = doc(db, 'users', userId);
    const userDoc = await getDoc(userRef);
    if (!userDoc.exists() || !userDoc.data().xeroEmployeeId) {
      throw new Error('User not found or no Xero Employee ID set');
    }
    const xeroEmployeeId = userDoc.data().xeroEmployeeId;
  
    // Create in Xero first
    const createXeroLeave = httpsCallable(functions, 'createLeave');
    const xeroResponse = await createXeroLeave({
      employeeId: xeroEmployeeId,
      startDate: leaveData.startDate,
      endDate: leaveData.endDate,
      leaveTypeId: leaveData.leaveTypeId,
      description: leaveData.description || ''
    });
    
    // Get updated leave from Xero
    const getXeroLeave = httpsCallable(functions, 'getLeave');
    const updatedLeave = await getXeroLeave();
    
    // Update Firestore
    const employeeLeaveRef = doc(db, COLLECTION, userId);
    await setDoc(employeeLeaveRef, {
      userId,
      leave: updatedLeave.data,
      updatedAt: serverTimestamp()
    }, { merge: true });
  
    return xeroResponse.data;
  }
  
  export async function updateLeave(id: string, data: Partial<Leave>): Promise<void> {
    const userId = auth.currentUser?.uid;
    if (!userId) throw new Error('User not authenticated');
    
    // Get user's Xero employee ID
    const userRef = doc(db, 'users', userId);
    const userDoc = await getDoc(userRef);
    if (!userDoc.exists() || !userDoc.data().xeroEmployeeId) {
      throw new Error('User not found or no Xero Employee ID set');
    }
    const xeroEmployeeId = userDoc.data().xeroEmployeeId;
  
    // Update in Xero first
    const updateXeroLeave = httpsCallable(functions, 'updateLeave');
    await updateXeroLeave({ 
      employeeId: xeroEmployeeId,
      leaveId: id,
      leaveData: {
        startDate: data.startDate,
        endDate: data.endDate,
        leaveTypeId: data.leaveTypeId,
        description: data.description
      }
    });
  
    // Get updated leave from Xero
    const getXeroLeave = httpsCallable(functions, 'getLeave');
    const updatedLeave = await getXeroLeave();
    
    // Update Firestore
    const employeeLeaveRef = doc(db, COLLECTION, userId);
    await setDoc(employeeLeaveRef, {
      userId,
      leave: updatedLeave.data,
      updatedAt: serverTimestamp()
    }, { merge: true });
  }
  
  export async function deleteLeave(id: string): Promise<void> {
    const userId = auth.currentUser?.uid;
    if (!userId) throw new Error('User not authenticated');
    
    // Get user's Xero employee ID
    const userRef = doc(db, 'users', userId);
    const userDoc = await getDoc(userRef);
    if (!userDoc.exists() || !userDoc.data().xeroEmployeeId) {
      throw new Error('User not found or no Xero Employee ID set');
    }
    const xeroEmployeeId = userDoc.data().xeroEmployeeId;
  
    // Delete from Xero first
    const deleteXeroLeave = httpsCallable(functions, 'deleteLeave');
    await deleteXeroLeave({ employeeId: xeroEmployeeId, leaveId: id });
  
    // Get updated leave from Xero
    const getXeroLeave = httpsCallable(functions, 'getLeave');
    const updatedLeave = await getXeroLeave();
    
    // Update Firestore
    const employeeLeaveRef = doc(db, COLLECTION, userId);
    await setDoc(employeeLeaveRef, {
      userId,
      leave: updatedLeave.data,
      updatedAt: serverTimestamp()
    }, { merge: true });
  }