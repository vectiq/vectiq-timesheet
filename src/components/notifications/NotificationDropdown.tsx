import { Fragment } from 'react';
import { Menu, Transition } from '@headlessui/react';
import { Bell, Clock, CheckCircle, XCircle, AlertTriangle, ExternalLink } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { cn } from '@/lib/utils/styles';
import { Button } from '@/components/ui/Button';

interface Notification {
  id: string;
  type: 'approval' | 'rejection' | 'reminder' | 'warning';
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
  action?: {
    label: string;
    href: string;
  };
}

const MOCK_NOTIFICATIONS: Notification[] = [
  {
    id: '1',
    type: 'approval',
    title: 'Timesheet Approved',
    message: 'Your timesheet for Project X has been approved',
    timestamp: new Date(Date.now() - 1000 * 60 * 30), // 30 minutes ago
    read: false,
    action: {
      label: 'View Timesheet',
      href: '/'
    }
  },
  {
    id: '2',
    type: 'reminder',
    title: 'Timesheet Due Soon',
    message: 'Remember to submit your timesheet for this week',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
    read: false
  },
  {
    id: '3',
    type: 'warning',
    title: 'Overtime Alert',
    message: 'You have exceeded your weekly hours limit',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24), // 1 day ago
    read: true
  },
  {
    id: '4',
    type: 'rejection',
    title: 'Timesheet Rejected',
    message: 'Your timesheet needs revision. Please check the comments.',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 48), // 2 days ago
    read: true,
    action: {
      label: 'Review Comments',
      href: '/'
    }
  }
];

const getNotificationIcon = (type: Notification['type']) => {
  switch (type) {
    case 'approval':
      return <CheckCircle className="h-5 w-5 text-green-500" />;
    case 'rejection':
      return <XCircle className="h-5 w-5 text-red-500" />;
    case 'reminder':
      return <Clock className="h-5 w-5 text-blue-500" />;
    case 'warning':
      return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
  }
};

export function NotificationDropdown() {
  const unreadCount = MOCK_NOTIFICATIONS.filter(n => !n.read).length;

  return (
    <Menu as="div" className="relative">
      <Menu.Button className="relative rounded-full p-2 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500">
        <Bell className="h-5 w-5 text-gray-600 bell-icon" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs font-medium text-white ring-2 ring-white">
            {unreadCount}
          </span>
        )}
      </Menu.Button>

      <Transition
        as={Fragment}
        enter="transition ease-out duration-100"
        enterFrom="transform opacity-0 scale-95"
        enterTo="transform opacity-100 scale-100"
        leave="transition ease-in duration-75"
        leaveFrom="transform opacity-100 scale-100"
        leaveTo="transform opacity-0 scale-95"
      >
        <Menu.Items className="absolute right-0 z-50 mt-2 w-96 origin-top-right rounded-lg bg-white py-2 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
          <div className="px-4 py-2 border-b border-gray-100">
            <h3 className="text-sm font-semibold text-gray-900">Notifications</h3>
          </div>

          <div className="max-h-[calc(100vh-200px)] overflow-y-auto">
            {MOCK_NOTIFICATIONS.map((notification) => (
              <Menu.Item key={notification.id}>
                {({ active }) => (
                  <div
                    className={cn(
                      'flex gap-4 px-4 py-3 border-b border-gray-100 last:border-0',
                      active && 'bg-gray-50',
                      !notification.read && 'bg-blue-50/50'
                    )}
                  >
                    <div className="flex-shrink-0 pt-1">
                      {getNotificationIcon(notification.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start">
                        <p className="text-sm font-medium text-gray-900">
                          {notification.title}
                        </p>
                        <span className="text-xs text-gray-500">
                          {formatDistanceToNow(notification.timestamp, { addSuffix: true })}
                        </span>
                      </div>
                      <p className="mt-1 text-sm text-gray-600">
                        {notification.message}
                      </p>
                      {notification.action && (
                        <Button
                          variant="secondary"
                          size="sm"
                          className="mt-2"
                          onClick={() => window.location.href = notification.action!.href}
                        >
                          <ExternalLink className="h-4 w-4 mr-2" />
                          {notification.action.label}
                        </Button>
                      )}
                    </div>
                  </div>
                )}
              </Menu.Item>
            ))}
          </div>

          <div className="px-4 py-2 border-t border-gray-100">
            <Button variant="secondary" size="sm" className="w-full">
              View All Notifications
            </Button>
          </div>
        </Menu.Items>
      </Transition>
    </Menu>
  );
}