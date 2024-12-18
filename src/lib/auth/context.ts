import { createContext } from 'react';
import type { Member } from '@/types';

export interface AuthContextType {
  user: Member | null;
  isLoading: boolean;
  error: string | null;
  signIn: (method: 'google' | 'email', options?: { 
    email?: string; 
    password?: string; 
    isSignUp?: boolean 
  }) => Promise<void>;
  signOut: () => Promise<void>;
  clearError: () => void;
}

export const AuthContext = createContext<AuthContextType | null>(null);