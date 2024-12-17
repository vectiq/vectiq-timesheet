import { useAuth0 } from '@auth0/auth0-react';

export function useAuth() {
  const auth = useAuth0();

  return {
    user: auth.user,
    isLoading: auth.isLoading,
    isAuthenticated: auth.isAuthenticated,
    login: auth.loginWithRedirect,
    logout: auth.logout,
  };
}