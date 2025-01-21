import { Clock, Building2, FolderKanban, BarChart2, TrendingUp, UserCircle, Settings, FileCheck, CalendarDays, HelpCircle, Users, DollarSign } from 'lucide-react';

export const navigationItems = [
  { name: 'Timesheet', href: '/', icon: Clock, roles: ['user', 'admin'] },
  { name: 'Leave', href: '/leave', icon: CalendarDays, roles: ['user', 'admin'] },
  { name: 'Processing', href: '/processing', icon: FileCheck, roles: ['admin'] },
  { name: 'Bonuses', href: '/bonuses', icon: DollarSign, roles: ['admin'] },
  { name: 'Forecast Entry', href: '/forecast', icon: TrendingUp, roles: ['admin'] },
  { name: 'Reports', href: '/reports', icon: BarChart2, roles: ['admin'] },
  { name: 'Projects', href: '/projects', icon: FolderKanban, roles: ['admin'] },
  { name: 'Clients', href: '/clients', icon: Building2, roles: ['admin'] },
  { name: 'Users', href: '/users', icon: UserCircle, roles: ['admin'] },
  { name: 'Teams', href: '/teams', icon: Users, roles: ['admin'] },
  { name: 'Admin', href: '/admin', icon: Settings, roles: ['admin'] },
  { name: 'Help & Support', href: '/help', icon: HelpCircle, roles: ['user', 'admin'] }
] as const;