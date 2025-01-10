import { Clock, Users, FolderKanban, BarChart2, TrendingUp, LineChart, UserCircle, Settings, FileCheck, CalendarDays } from 'lucide-react';

export const navigationItems = [
  { name: 'Timesheet', href: '/', icon: Clock, roles: ['user', 'admin'] },
  { name: 'Leave', href: '/leave', icon: CalendarDays, roles: ['user', 'admin'] },
  { name: 'Monthly Processing', href: '/processing', icon: FileCheck, roles: ['admin'] },
  { name: 'Forecast Entry', href: '/forecast', icon: TrendingUp, roles: ['admin'] },
  { name: 'Forecast Report', href: '/forecast/report', icon: LineChart, roles: ['admin'] },
  { name: 'Reports', href: '/reports', icon: BarChart2, roles: ['admin'] },
  { name: 'Projects', href: '/projects', icon: FolderKanban, roles: ['admin'] },
  { name: 'Clients', href: '/clients', icon: Users, roles: ['admin'] },
  { name: 'Users', href: '/users', icon: UserCircle, roles: ['admin'] },
  { name: 'Admin', href: '/admin', icon: Settings, roles: ['admin'] }
] as const;