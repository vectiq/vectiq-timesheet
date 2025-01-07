import { Clock, Users, FolderKanban, BarChart2, Briefcase, UserCircle, Database, TrendingUp } from 'lucide-react';

export const navigationItems = [
  { name: 'Timesheet', href: '/', icon: Clock, roles: ['user', 'admin'] },
  { name: 'Reports', href: '/reports', icon: BarChart2, roles: ['admin'] },
  { name: 'Forecasting', href: '/forecasting', icon: TrendingUp, roles: ['admin'] },
  { name: 'Projects', href: '/projects', icon: FolderKanban, roles: ['admin'] },
  { name: 'Roles', href: '/roles', icon: Briefcase, roles: ['admin'] },
  { name: 'Clients', href: '/clients', icon: Users, roles: ['admin'] },
  { name: 'Users', href: '/users', icon: UserCircle, roles: ['admin'] },
  { name: 'Test Data', href: '/seed', icon: Database, roles: ['admin'] }
] as const;