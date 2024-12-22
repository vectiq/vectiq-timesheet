import { useState, useEffect } from 'react';
import { useUsers } from '@/lib/hooks/useUsers';
import { auth } from '@/lib/firebase';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { FormField } from '@/components/ui/FormField';
import { Loader2 } from 'lucide-react';

export default function Profile() {
  const { currentUser, updateUser, isUpdating, sendPasswordReset } = useUsers();
  const user = auth.currentUser;
  const [name, setName] = useState(currentUser?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (currentUser?.name) {
      setName(currentUser.name);
    }
  }, [currentUser?.name]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    try {
      await updateUser(currentUser.id, { name, email });
      setMessage('Profile updated successfully');
    } catch (error) {
      setMessage('Failed to update profile');
    }
  };

  const handlePasswordReset = async () => {
    if (!user?.email) return;
    
    try {
      await sendPasswordReset(user.email);
      setMessage('Password reset email sent');
    } catch (error) {
      setMessage('Failed to send password reset email');
    }
  };

  if (!user) {
    return null;
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold text-gray-900">Profile Settings</h1>

      <Card className="max-w-2xl">
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <FormField label="Name">
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            />
          </FormField>

          <FormField label="Email">
            <input
              type="email"
              disabled
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            />
          </FormField>

          {message && (
            <div className={`text-sm ${message.includes('Failed') ? 'text-red-600' : 'text-green-600'}`}>
              {message}
            </div>
          )}

          <div className="flex items-center justify-between pt-4 border-t">
            <Button
              type="button"
              variant="secondary"
              onClick={handlePasswordReset}
            >
              Reset Password
            </Button>

            <Button type="submit" disabled={isUpdating}>
              {isUpdating && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Save Changes
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}