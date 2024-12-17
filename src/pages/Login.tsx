import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/lib/auth/AuthProvider';
import { Button } from '@/components/ui/Button';
import { Mail } from 'lucide-react';
import { FormField } from '@/components/ui/FormField';

export default function Login() {
  const { user, isLoading, signIn } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [error, setError] = useState('');

  if (user && !isLoading) {
    navigate('/');
    return null;
  }

  if (isLoading) {
    return <div>Loading...</div>;
  }

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    try {
      await signIn('email', { email, password, isSignUp });
      navigate('/');
    } catch (err: any) {
      setError(err.message || 'An error occurred during sign in');
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

        <form className="mt-8 space-y-6" onSubmit={handleEmailSubmit}>
          <div className="rounded-md shadow-sm space-y-4">
            <FormField label="Email address" error={error}>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                placeholder="Email address"
              />
            </FormField>

            <FormField label="Password">
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                placeholder="Password"
              />
            </FormField>
          </div>

          <div>
            <Button type="submit" className="w-full">
              {isSignUp ? 'Create Account' : 'Sign In'}
            </Button>
          </div>

          <div className="text-center">
            <button
              type="button"
              onClick={() => setIsSignUp(!isSignUp)}
              className="text-sm text-indigo-600 hover:text-indigo-500"
            >
              {isSignUp ? 'Already have an account? Sign in' : 'Need an account? Sign up'}
            </button>
          </div>
        </form>

        <div className="mt-6">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-gray-50 text-gray-500">Or continue with</span>
            </div>
          </div>

          <div className="mt-6">
            <Button
              onClick={() => signIn('google')}
              variant="secondary"
              className="w-full"
            >
              <Mail className="w-5 h-5 mr-2" />
              Continue with Google
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}