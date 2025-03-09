import { Clock, CalendarDays } from 'lucide-react';
import { User } from '@/types';

export const getNavigationItems = (user?: User | null) => [
  { name: 'Timesheet', href: '/', icon: Clock, roles: ['user', 'admin'] },
  ...(user?.employeeType === 'employee' ? [
    { name: 'Leave', href: '/leave', icon: CalendarDays, roles: ['user', 'admin'] }
  ] : [])
]