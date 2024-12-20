import { db } from '@/lib/firebase';
import { 
  collection,
  doc,
  setDoc,
  updateDoc,
  getDoc,
  getDocs,
  deleteDoc
} from 'firebase/firestore';
import type { User } from '@/types';

export async function createUserProfile(uid: string, userData: Partial<User>) {
  const userRef = doc(db, 'users', uid);
  await setDoc(userRef, {
    ...userData,
    role: 'user', // Default role
    isActive: true,
    createdAt: new Date().toISOString(),
  });
}

export async function updateUserProfile(uid: string, data: Partial<User>) {
  const userRef = doc(db, 'users', uid);
  await updateDoc(userRef, data);
}

export async function getUserProfile(uid: string) {
  const userRef = doc(db, 'users', uid);
  const userSnap = await getDoc(userRef);
  return userSnap.exists() ? { id: userSnap.id, ...userSnap.data() } as User : null;
}

export async function getAllUsers() {
  const usersCollection = collection(db, 'users');
  const usersSnapshot = await getDocs(usersCollection);
  const usersList = usersSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as User[];
  return usersList;
}