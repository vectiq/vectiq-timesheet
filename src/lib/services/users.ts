import { 
  collection,
  doc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  serverTimestamp,
  query,
  where
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { User, ProjectAssignment } from '@/types';

// User Operations
export async function getUsers(): Promise<User[]> {
  const snapshot = await getDocs(collection(db, 'users'));
  console.log(snapshot);
  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  })) as User[];
}

export async function createUser(userData: Omit<User, 'id'>): Promise<User> {
  const userRef = doc(collection(db, 'users'));
  const user: User = {
    id: userRef.id,
    ...userData,
    createdAt: serverTimestamp(),
  };
  
  await setDoc(userRef, user);
  return user;
}

export async function updateUser(id: string, userData: Partial<User>): Promise<void> {
  const userRef = doc(db, 'users', id);
  await updateDoc(userRef, {
    ...userData,
    updatedAt: serverTimestamp(),
  });
}

export async function deleteUser(id: string): Promise<void> {
  const userRef = doc(db, 'users', id);
  await deleteDoc(userRef);
}

// Project Assignment Operations
export async function getProjectAssignments(): Promise<ProjectAssignment[]> {
  const snapshot = await getDocs(collection(db, 'projectAssignments'));
  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  })) as ProjectAssignment[];
}

export async function getUserProjectAssignments(userId: string): Promise<ProjectAssignment[]> {
  const q = query(
    collection(db, 'projectAssignments'),
    where('userId', '==', userId)
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  })) as ProjectAssignment[];
}

export async function createProjectAssignment(
  assignment: Omit<ProjectAssignment, 'id'>
): Promise<ProjectAssignment> {
  const assignmentRef = doc(collection(db, 'projectAssignments'));
  const newAssignment: ProjectAssignment = {
    id: assignmentRef.id,
    ...assignment,
  };
  
  await setDoc(assignmentRef, newAssignment);
  return newAssignment;
}

export async function deleteProjectAssignment(id: string): Promise<void> {
  const assignmentRef = doc(db, 'projectAssignments', id);
  await deleteDoc(assignmentRef);
}