import { Navigate } from 'react-router-dom';
import { useAuth } from '@/lib/auth'; // Updated import
import { LoadingScreen } from './LoadingScreen';

export default function PrivateRoute({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return <LoadingScreen />;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}