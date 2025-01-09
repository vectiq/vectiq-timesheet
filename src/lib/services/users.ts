import {
  collection,
  doc,
  writeBatch,
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

const COLLECTION = 'users';

// User Operations
export async function getUsers(): Promise<User[]> {
  // Get all users
  const usersSnapshot = await getDocs(collection(db, COLLECTION));
  const users = usersSnapshot.docs.map(doc => ({
    ...doc.data(),
    id: doc.id
  }));

  return users as User[];
}

// Get the current user
export async function getCurrentUser(): Promise<User | null> {
  const auth = getAuth();
  const user = auth.currentUser;

  if (!user) {
    return null;
  }

  const userRef = doc(db, COLLECTION, user.uid);
  const userDoc = await getDoc(userRef);

  if (!userDoc.exists()) {
    return null;
  }
  
  const userData = userDoc.data();
  return {
    id: user.uid,
    ...userData,
    projectAssignments: userData.projectAssignments || [],
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
  const userRef = doc(db, COLLECTION, userCredential.data.uid);
  const user: User = {
    id: userCredential.data.uid,
    ...data,
    projectAssignments: [],
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
  const userRef = doc(db, COLLECTION, id);
  const updateData = {
    ...data,
    updatedAt: serverTimestamp(),
  };
  await updateDoc(userRef, updateData);
}

export async function deleteUser(id: string): Promise<void> {
  const functions = getFunctions();
  const deleteUserFunction = httpsCallable(functions, 'deleteUser');

  // Delete the auth user first
  try {
    await deleteUserFunction({ userId: id });
  } catch (error) {
    console.error('Error deleting auth user:', error);
    throw error;
  }

  // Then delete the Firestore document
  const userRef = doc(db, COLLECTION, id);
  await deleteDoc(userRef);
}

export async function createProjectAssignment(userId: string, data: Omit<ProjectAssignment, 'id'>): Promise<void> {
  const userRef = doc(db, COLLECTION, userId);
  const userDoc = await getDoc(userRef);
  const clientRef = doc(db, 'clients', data.clientId);
  const projectRef = doc(db, 'projects', data.projectId);
  
  const [clientDoc, projectDoc] = await Promise.all([
    getDoc(clientRef),
    getDoc(projectRef)
  ]);
  
  if (!userDoc.exists() || !clientDoc.exists() || !projectDoc.exists()) {
    throw new Error('User not found');
  }
  
  const client = clientDoc.data();
  const project = projectDoc.data();
  const projectRole = project.roles.find(r => r.id === data.roleId);
  
  if (!projectRole) {
    throw new Error('Role not found');
  }
  
  const user = userDoc.data() as User;
  const assignments = user.projectAssignments || [];
  
  assignments.push({
    ...data,
    id: crypto.randomUUID(),
    clientName: client.name,
    projectName: project.name,
    roleName: projectRole.name
  });
  
  await updateDoc(userRef, {
    projectAssignments: assignments,
    updatedAt: serverTimestamp()
  });
}

export async function deleteProjectAssignment(userId: string, assignmentId: string): Promise<void> {
  const userRef = doc(db, COLLECTION, userId);
  const userDoc = await getDoc(userRef);
  
  if (!userDoc.exists()) {
    throw new Error('User not found');
  }
  
  const user = userDoc.data() as User;
  const assignments = user.projectAssignments || [];
  
  const updatedAssignments = assignments.filter(a => a.id !== assignmentId);

  await updateDoc(userRef, {
    projectAssignments: updatedAssignments,
    updatedAt: serverTimestamp()
  });
}