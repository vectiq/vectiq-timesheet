import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from '@/lib/auth/AuthProvider';
import { Layout } from './components/layout/Layout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import TimeEntries from './pages/TimeEntries';
import Projects from './pages/Projects';
import Clients from './pages/Clients';
import Members from './pages/Members';
import PrivateRoute from './components/auth/PrivateRoute';

const queryClient = new QueryClient();

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/login" element={<Login />} />
            
            <Route path="/" element={<PrivateRoute><Layout /></PrivateRoute>}>
              <Route index element={<TimeEntries />} />
              <Route path="dashboard" element={<Dashboard />} />
              <Route path="time-entries" element={<Navigate to="/" replace />} />
              <Route path="projects" element={<Projects />} />
              <Route path="clients" element={<Clients />} />
              <Route path="members" element={<Members />} />
            </Route>
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </QueryClientProvider>
  );
}