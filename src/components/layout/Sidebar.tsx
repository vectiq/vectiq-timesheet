import { Link, useLocation } from 'react-router-dom';
import { getNavigationItems } from '@/lib/constants/navigation';
import { useUsers } from '@/lib/hooks/useUsers';
import { useMemo } from 'react';
import { TooltipProvider, TooltipRoot, TooltipTrigger, TooltipContent } from '@/components/ui/Tooltip';
import { cn } from '@/lib/utils/styles';

export function Sidebar() {
  const location = useLocation();
  const { currentUser } = useUsers();

  // Filter navigation items based on user role
  const allowedItems = useMemo(() => 
    getNavigationItems(currentUser).filter(item =>
      item.roles.includes(currentUser?.role || 'user')
    ),
    [currentUser?.role]
  );

  return (
    <div className="hidden lg:fixed lg:inset-y-0 lg:z-30 lg:flex lg:w-16 lg:flex-col">
      <div className="flex grow flex-col gap-y-5 overflow-y-auto bg-white px-6 pb-4 pt-20 shadow-xl relative">
        {/* Color bursts */}
        <div className="absolute bottom-0 left-0 right-0 h-96 overflow-hidden pointer-events-none">
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-[#70529c]/20 rounded-full blur-3xl transform -translate-x-1/2 translate-y-1/4" />
          <div className="absolute bottom-0 right-0 w-64 h-64 bg-[#70529c]/15 rounded-full blur-3xl transform translate-x-1/3 translate-y-1/3" />
          <div className="absolute bottom-12 left-1/2 w-40 h-40 bg-[#70529c]/25 rounded-full blur-3xl transform -translate-x-1/2" />
        </div>

        <nav className="flex flex-1 flex-col">
          <ul role="list" className="flex flex-1 flex-col gap-y-7">
            <li>
              <ul role="list" className="-mx-6 space-y-1">
                {allowedItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = location.pathname === item.href;

                  return (
                    <li key={item.name}>
                      <TooltipProvider>
                        <TooltipRoot>
                          <TooltipTrigger asChild>
                            <Link
                              to={item.href}
                              className={cn(
                                'group flex items-center justify-center rounded-lg p-2 transition-all duration-300',
                                'hover:bg-gray-50',
                                isActive
                                  ? 'bg-gray-50 text-indigo-600'
                                  : 'text-gray-700 hover:text-gray-900'
                              )}
                            >
                              <Icon
                                className={cn(
                                  'h-6 w-6 shrink-0',
                                  'transition-all duration-300 group-hover:scale-110 group-hover:rotate-3',
                                  isActive
                                    ? 'text-indigo-600'
                                    : 'text-gray-500 group-hover:text-gray-900'
                                )}
                              />
                            </Link>
                          </TooltipTrigger>
                          <TooltipContent side="right">
                            {item.name}
                          </TooltipContent>
                        </TooltipRoot>
                      </TooltipProvider>
                    </li>
                  );
                })}
              </ul>
            </li>
          </ul>
        </nav>
      </div>
    </div>
  );
}