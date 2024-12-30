import {
  collection,
  doc,
  getDocs,
  getDoc,
  setDoc,
  query,
  where,
  updateDoc,
  deleteDoc,
  serverTimestamp,
} from 'firebase/firestore';
import { getFunctions, httpsCallable } from "firebase/functions";
import {
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  onAuthStateChanged,
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

  const assignmentsQuery = query(
    collection(db, ASSIGNMENTS_COLLECTION),
    where('userId', '==', user.uid)
  );
  var assignmentsSnapshot;
  try {
    assignmentsSnapshot = await getDocs(assignmentsQuery);
  } catch (error) {
    console.error('Error getting user assignments', error);
  }
  const projectAssignments = assignmentsSnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  })) as ProjectAssignment[];

  return {
    id: user.uid,
    ...userDoc.data(),
    projectAssignments,
  } as User;
}

export async function createUser(data: Omit<User, 'id' | 'createdAt' | 'updatedAt'>): Promise<User> {
  const auth = getAuth();
  const idToken = await auth.currentUser.getIdToken(true);
  const functions = getFunctions();
  const tempPassword = generatePassword();

  // Create the user in Firebase Auth
  var userCredential;
  const email = data.email;

  const createUser = httpsCallable(functions, "createUser");
  try {
    userCredential = await createUser({ email, tempPassword });
    console.log("User created successfully:", userCredential.data.uid);
  } catch (error) {
    console.error("Error creating user:", error.message);
  }

  // Create the user document in Firestore
  const userRef = doc(db, USERS_COLLECTION, userCredential.data.uid);
  const user: User = {
    id: userCredential.data.uid,
    ...data,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  };
  try {
    await setDoc(userRef, user);
  } catch (error) {
    console.error("Error setting document:", error.code, error.message);
    throw error;
  }

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