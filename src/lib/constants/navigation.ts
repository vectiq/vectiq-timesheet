import { Clock, Building2, FolderKanban, BarChart2, TrendingUp, UserCircle, Settings, FileCheck, CalendarDays, HelpCircle, Users, DollarSign } from 'lucide-react';

export const navigationItems = [
  { name: 'Timesheet', href: '/', icon: Clock, roles: ['user', 'admin'] },
  { name: 'Leave', href: '/leave', icon: CalendarDays, roles: ['user', 'admin'] },
  { name: 'Help & Support', href: '/help', icon: HelpCircle, roles: ['user', 'admin'] }
] as const;