import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../config';
import type { User as FirebaseUser } from 'firebase/auth';
import type { Member } from '@/types';

export async function createOrUpdateUser(firebaseUser: FirebaseUser): Promise<Member> {
  const { email, displayName, uid } = firebaseUser;
  
  if (!email) {
    throw new Error('Email is required');
  }

  try {
    const userRef = doc(db, 'members', uid);
    const userDoc = await getDoc(userRef);

    if (userDoc.exists()) {
      const userData = userDoc.data() as Member;
      if (userData.status === 'pending') {
        throw new Error('Your account is pending approval');
      }
      return userData;
    }

    const newUser: Member = {
      id: uid,
      email,
      name: displayName || undefined,
      role: 'consultant',
      status: 'pending',
    };

    await setDoc(userRef, newUser);
    throw new Error('Account created and pending approval');
  } catch (error) {
    if (error instanceof Error) throw error;
    throw new Error('An error occurred while managing your account');
  }
}