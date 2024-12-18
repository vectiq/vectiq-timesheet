import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/lib/auth';
import { EmailSignInForm } from '@/components/auth/EmailSignInForm';
import { SocialSignIn } from '@/components/auth/SocialSignIn';
import { LoadingScreen } from '@/components/ui/LoadingScreen';

export default function Login() {
  const { user, isLoading, error, signIn, clearError } = useAuth();
  const navigate = useNavigate();
  const [isSignUp, setIsSignUp] = useState(false);

  if (user && !isLoading) {
    navigate('/');
    return null;
  }

  if (isLoading) {
    return <LoadingScreen />;
  }

  const handleEmailSubmit = async (email: string, password: string) => {
    try {
      clearError();
      await signIn('email', { email, password, isSignUp });
      navigate('/');
    } catch (err) {
      // Error is handled by AuthProvider
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      clearError();
      await signIn('google');
      navigate('/');
    } catch (err) {
      // Error is handled by AuthProvider
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            {isSignUp ? 'Create your account' : 'Sign in to your account'}
          </h2>
        </div>

        <EmailSignInForm
          onSubmit={handleEmailSubmit}
          isSignUp={isSignUp}
          error={error}
        />

        <div className="text-center">
          <button
            type="button"
            onClick={() => setIsSignUp(!isSignUp)}
            className="text-sm text-indigo-600 hover:text-indigo-500"
          >
            {isSignUp ? 'Already have an account? Sign in' : 'Need an account? Sign up'}
          </button>
        </div>

        <SocialSignIn onGoogleSignIn={handleGoogleSignIn} />
      </div>
    </div>
  );
}