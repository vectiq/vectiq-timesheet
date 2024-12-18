import { User as FirebaseUser } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
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
        throw new Error('Your account is pending approval. Please contact an administrator.');
      }
      return userData;
    }

    // Create new user with pending status
    const newUser: Member = {
      id: uid,
      email,
      name: displayName || undefined,
      role: 'consultant',
      status: 'pending',
    };

    try {
      await setDoc(userRef, newUser);
      throw new Error('Your account has been created and is pending approval. Please contact an administrator.');
    } catch (error: any) {
      if (error?.code === 'permission-denied') {
        throw new Error('Unable to create account. Please contact an administrator.');
      }
      throw error;
    }
  } catch (error) {
    if (error instanceof Error) {
      throw error; // Rethrow user-friendly errors
    }
    console.error('Error managing user:', error);
    throw new Error('An error occurred while managing your account. Please try again.');
  }
}