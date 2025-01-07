import { Clock, Users, FolderKanban, BarChart2, UserCircle, Settings } from 'lucide-react';

export const navigationItems = [
  { name: 'Timesheet', href: '/', icon: Clock, roles: ['user', 'admin'] },
  { name: 'Reports', href: '/reports', icon: BarChart2, roles: ['admin'] },
  { name: 'Projects', href: '/projects', icon: FolderKanban, roles: ['admin'] },
  { name: 'Clients', href: '/clients', icon: Users, roles: ['admin'] },
  { name: 'Users', href: '/users', icon: UserCircle, roles: ['admin'] },
  { name: 'Admin', href: '/admin', icon: Settings, roles: ['admin'] }
] as const;