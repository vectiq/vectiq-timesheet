import { Clock, CalendarDays, HelpCircle } from 'lucide-react';

export const navigationItems = [
  { name: 'Timesheet', href: '/', icon: Clock, roles: ['user', 'admin'] },
  { name: 'Leave', href: '/leave', icon: CalendarDays, roles: ['user', 'admin'] },
  { name: 'Help & Support', href: '/help', icon: HelpCircle, roles: ['user', 'admin'] }
] as const;