import { Clock, Users, FolderKanban, BarChart2, TrendingUp, LineChart, UserCircle, Settings } from 'lucide-react';

export const navigationItems = [
  { name: 'Timesheet', href: '/', icon: Clock, roles: ['user', 'admin'] },
  { name: 'Forecast Entry', href: '/forecast', icon: TrendingUp, roles: ['admin'] },
  { name: 'Forecast Report', href: '/forecast/report', icon: LineChart, roles: ['admin'] },
  { name: 'Reports', href: '/reports', icon: BarChart2, roles: ['admin'] },
  { name: 'Projects', href: '/projects', icon: FolderKanban, roles: ['admin'] },
  { name: 'Clients', href: '/clients', icon: Users, roles: ['admin'] },
  { name: 'Users', href: '/users', icon: UserCircle, roles: ['admin'] },
  { name: 'Admin', href: '/admin', icon: Settings, roles: ['admin'] }
] as const;