import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Layout } from '@/components/layout';
import { useStore } from '@/lib/store';
import { mockRoles, mockProjects, mockClients, mockTimeEntries } from '@/lib/services/mockData';
import TimeEntries from '@/pages/TimeEntries';
import Reports from '@/pages/Reports';
import Projects from '@/pages/Projects';
import Roles from '@/pages/Roles';
import Clients from '@/pages/Clients';
import Users from '@/pages/Users';
import { useEffect } from 'react';

const queryClient = new QueryClient();

export default function App() {
  const store = useStore();

  // Initialize store with mock data
  useEffect(() => {
    store.setRoles(mockRoles);
    store.setProjects(mockProjects);
    store.setClients(mockClients);
    store.setTimeEntries(mockTimeEntries);
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<TimeEntries />} />
            <Route path="reports" element={<Reports />} />
            <Route path="projects" element={<Projects />} />
            <Route path="roles" element={<Roles />} />
            <Route path="clients" element={<Clients />} />
            <Route path="users" element={<Users />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  );
}