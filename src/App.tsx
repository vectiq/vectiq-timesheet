import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { Layout } from '@/components/layout/Layout';
import Login from '@/pages/Login';
import TimeEntries from '@/pages/TimeEntries';
import Reports from '@/pages/Reports';
import Projects from '@/pages/Projects';
import Roles from '@/pages/Roles';
import Clients from '@/pages/Clients';
import Users from '@/pages/Users';
import TestData from '@/pages/TestData';
import Profile from '@/pages/Profile';

// const queryClient = new QueryClient({
//   defaultOptions: {
//     queries: {
//       // Disable automatic refetching
//       refetchOnWindowFocus: true,
//       refetchOnReconnect: false,
//       refetchOnMount: true,
//       // Cache data for 5 minutes
//       staleTime: 5 * 60 * 1000,
//       // Keep unused data in cache for 10 minutes
//       gcTime: 10 * 60 * 1000,
//     },
//   },
// });
const queryClient = new QueryClient()

export default function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  if (loading) {
    return <div className="min-h-screen bg-gray-50" />;
  }

  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          {user ? (
            <Route path="/" element={<Layout />}>
              <Route index element={<TimeEntries />} />
              <Route path="reports" element={<Reports />} />
              <Route path="projects" element={<Projects />} />
              <Route path="roles" element={<Roles />} />
              <Route path="clients" element={<Clients />} />
              <Route path="profile" element={<Profile />} />
              <Route path="users" element={<Users />} />
              <Route path="test-data" element={<TestData />} />
            </Route>
          ) : (
            <Route path="*" element={<Navigate to="/login" />} />
          )}
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  );
}