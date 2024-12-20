import { Clock, Users, FolderKanban, BarChart2, Briefcase, UserCircle } from 'lucide-react';

export const navigationItems = [
  { name: 'Timesheet', href: '/', icon: Clock },
  { name: 'Reports', href: '/reports', icon: BarChart2 },
  { name: 'Projects', href: '/projects', icon: FolderKanban },
  { name: 'Roles', href: '/roles', icon: Briefcase },
  { name: 'Clients', href: '/clients', icon: Users },
  { name: 'Users', href: '/users', icon: UserCircle },
] as const;