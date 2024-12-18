import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { signInWithGoogle, signInWithEmail, createAccount, signOut, onAuthChange } from './firebase';
import { createOrUpdateUser } from './userManagement';
import { AuthContext } from './context';
import type { Member } from '@/types';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<Member | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const clearError = () => setError(null);

  useEffect(() => {
    const unsubscribe = onAuthChange(async (firebaseUser) => {
      try {
        setIsLoading(true);
        setError(null);
        
        if (firebaseUser) {
          const member = await createOrUpdateUser(firebaseUser);
          setUser(member);
        } else {
          setUser(null);
        }
      } catch (err) {
        const message = err instanceof Error ? err.message : 'An error occurred';
        setError(message);
        setUser(null);
        if (!firebaseUser) {
          navigate('/login');
        }
      } finally {
        setIsLoading(false);
      }
    });

    return () => unsubscribe();
  }, [navigate]);

  const handleSignIn = async (
    method: 'google' | 'email',
    options?: { email?: string; password?: string; isSignUp?: boolean }
  ) => {
    try {
      setIsLoading(true);
      setError(null);

      if (method === 'google') {
        await signInWithGoogle();
      } else if (method === 'email' && options?.email && options?.password) {
        if (options.isSignUp) {
          await createAccount(options.email, options.password);
        } else {
          await signInWithEmail(options.email, options.password);
        }
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'An error occurred during sign in';
      setError(message);
      throw new Error(message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignOut = async () => {
    try {
      setIsLoading(true);
      await signOut();
      setUser(null);
      navigate('/login');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'An error occurred during sign out';
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthContext.Provider 
      value={{ 
        user,
        isLoading,
        error,
        signIn: handleSignIn,
        signOut: handleSignOut,
        clearError
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}