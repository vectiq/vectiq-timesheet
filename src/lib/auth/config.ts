export const AUTH_CONFIG = {
  providers: {
    github: {
      clientId: import.meta.env.VITE_GITHUB_CLIENT_ID,
      scope: 'user:email',
    },
    google: {
      clientId: import.meta.env.VITE_GOOGLE_CLIENT_ID,
      scope: 'email profile',
    },
    facebook: {
      clientId: import.meta.env.VITE_FACEBOOK_CLIENT_ID,
      scope: 'email',
    },
    apple: {
      clientId: import.meta.env.VITE_APPLE_CLIENT_ID,
      scope: 'email name',
    },
  },
  redirectUri: import.meta.env.VITE_AUTH_REDIRECT_URI || 'http://localhost:5173/auth/callback',
};