import { createContext, useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { signInWithGoogle, signInWithEmail, createAccount, signOut, onAuthChange } from './firebase';
import type { Member } from '@/types';
import type { User as FirebaseUser } from 'firebase/auth';

interface AuthContextType {
  user: Member | null;
  isLoading: boolean;
  signIn: (method: 'google' | 'email', options?: { email?: string; password?: string; isSignUp?: boolean }) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

async function createOrUpdateMember(firebaseUser: FirebaseUser): Promise<Member> {
  const { email, displayName, uid } = firebaseUser;
  
  if (!email) {
    throw new Error('Email is required');
  }

  // Check if user exists in our database
  const response = await fetch(`${import.meta.env.VITE_API_URL}/members/check`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, uid }),
  });

  if (!response.ok) {
    throw new Error('Not authorized');
  }

  return response.json();
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<Member | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = onAuthChange(async (firebaseUser) => {
      try {
        if (firebaseUser) {
          const member = await createOrUpdateMember(firebaseUser);
          setUser(member);
        } else {
          setUser(null);
        }
      } catch (error) {
        console.error('Auth state change error:', error);
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  const handleSignIn = async (method: 'google' | 'email', options?: { email?: string; password?: string; isSignUp?: boolean }) => {
    try {
      if (method === 'google') {
        await signInWithGoogle();
      } else if (method === 'email' && options?.email && options?.password) {
        if (options.isSignUp) {
          await createAccount(options.email, options.password);
        } else {
          await signInWithEmail(options.email, options.password);
        }
      }
      navigate('/');
    } catch (error) {
      console.error('Sign in error:', error);
      throw error;
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      navigate('/login');
    } catch (error) {
      console.error('Sign out error:', error);
    }
  };

  return (
    <AuthContext.Provider 
      value={{ 
        user, 
        isLoading, 
        signIn: handleSignIn, 
        signOut: handleSignOut 
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}