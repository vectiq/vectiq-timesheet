import { 
  collection,
  doc,
  getDocs, 
  getDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  serverTimestamp,
} from 'firebase/firestore';
import { 
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  getAuth,
} from 'firebase/auth';
import { db } from '@/lib/firebase';
import { generatePassword } from '@/lib/utils/password';
import type { User, ProjectAssignment } from '@/types';

const USERS_COLLECTION = 'users';
const ASSIGNMENTS_COLLECTION = 'projectAssignments';

// User Operations
export async function getUsers(): Promise<User[]> {
  const snapshot = await getDocs(collection(db, USERS_COLLECTION));
  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  })) as User[];
}

// Get the current user
export async function getCurrentUser(): Promise<User | null> {
  const auth = getAuth();
  const user = auth.currentUser;
  
  if (!user) {
    return null;
  }

  const userRef = doc(db, USERS_COLLECTION, user.uid);
  const userDoc = await getDoc(userRef);

  if (!userDoc.exists()) {
    return null;
  }

  const assignmentsSnapshot = await getDocs(collection(db, ASSIGNMENTS_COLLECTION));
  const projectAssignments = assignmentsSnapshot.docs
    .filter(doc => doc.data().userId === user.uid)
    .map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as ProjectAssignment[];
    console.log({
      id: user.uid,
      ...userDoc.data(),
      projectAssignments
    } as User)
  return {
    id: user.uid,
    ...userDoc.data(),
    projectAssignments
  } as User;
}

export async function createUser(data: Omit<User, 'id' | 'createdAt' | 'updatedAt'>): Promise<User> {
  const auth = getAuth();
  const tempPassword = generatePassword();

  // Create the user in Firebase Auth
  const userCredential = await createUserWithEmailAndPassword(
    auth,
    data.email,
    tempPassword
  );

  // Create the user document in Firestore
  const userRef = doc(db, USERS_COLLECTION, userCredential.user.uid);
  const user: User = {
    id: userCredential.user.uid,
    ...data,
    projectAssignments: [],
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  };
  await setDoc(userRef, user);

  // Send password reset email
  await sendPasswordResetEmail(auth, data.email);

  return user;
}

export async function updateUser(id: string, data: Partial<User>): Promise<void> {
  const userRef = doc(db, USERS_COLLECTION, id);
  await updateDoc(userRef, {
    ...data,
    updatedAt: serverTimestamp(),
  });
}

export async function deleteUser(id: string): Promise<void> {
  const userRef = doc(db, USERS_COLLECTION, id);
  await deleteDoc(userRef);
}

// Project Assignment Operations
export async function getProjectAssignments(): Promise<ProjectAssignment[]> {
  const snapshot = await getDocs(collection(db, ASSIGNMENTS_COLLECTION));
  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  })) as ProjectAssignment[];
}

export async function createProjectAssignment(data: Omit<ProjectAssignment, 'id'>): Promise<ProjectAssignment> {
  const assignmentRef = doc(collection(db, ASSIGNMENTS_COLLECTION));
  const newAssignment: ProjectAssignment = {
    id: assignmentRef.id,
    clientId: data.clientId,
    ...data,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  };
  
  await setDoc(assignmentRef, newAssignment);
  return newAssignment;
}

export async function deleteProjectAssignment(id: string): Promise<void> {
  const assignmentRef = doc(db, ASSIGNMENTS_COLLECTION, id);
  await deleteDoc(assignmentRef);
}