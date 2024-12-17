import { Clock, Users, FolderKanban, PieChart, UserPlus } from 'lucide-react';

export const navigationItems = [
  { name: 'Timesheet', href: '/', icon: Clock },
  { name: 'Dashboard', href: '/dashboard', icon: PieChart },
  { name: 'Projects', href: '/projects', icon: FolderKanban },
  { name: 'Clients', href: '/clients', icon: Users },
  { name: 'Team', href: '/members', icon: UserPlus },
] as const;