import { Button } from '@/components/ui/Button';
import { Mail } from 'lucide-react';

interface SocialSignInProps {
  onGoogleSignIn: () => Promise<void>;
}

export function SocialSignIn({ onGoogleSignIn }: SocialSignInProps) {
  return (
    <div className="mt-6">
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-300" />
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="px-2 bg-gray-50 text-gray-500">
            Or continue with
          </span>
        </div>
      </div>

      <div className="mt-6">
        <Button
          onClick={onGoogleSignIn}
          variant="secondary"
          className="w-full"
        >
          <Mail className="w-5 h-5 mr-2" />
          Continue with Google
        </Button>
      </div>
    </div>
  );
}