import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/Sheet';
import { Menu } from 'lucide-react';
import { navigationItems } from '@/lib/constants/navigation';
import { Link, useLocation } from 'react-router-dom';
import { useUsers } from '@/lib/hooks/useUsers';
import { cn } from '@/lib/utils';
import { useMemo } from 'react';

export function MobileNav() {
  const location = useLocation();
  const { currentUser } = useUsers();

  const handleLinkClick = () => {
    const sheetTrigger = document.querySelector('[data-state="open"]');
    if (sheetTrigger) {
      (sheetTrigger as HTMLButtonElement).click();
    }
  };

  // Filter navigation items based on user role
  const allowedItems = useMemo(() => 
    navigationItems.filter(item =>
      item.roles.includes(currentUser?.role || 'user')
    ),
    [currentUser?.role]
  );

  return (
    <Sheet>
      <SheetTrigger asChild>
        <button
          type="button"
          className="lg:hidden -m-2.5 inline-flex items-center justify-center rounded-md p-2.5 text-gray-700"
        >
          <span className="sr-only">Open sidebar</span>
          <Menu className="h-6 w-6" aria-hidden="true" />
        </button>
      </SheetTrigger>
      <SheetContent side="left" className="w-72">
        <div className="flex h-16 shrink-0 items-center bg-gradient-to-r from-indigo-700 to-indigo-600 -m-6 px-6 mb-0">
          <div className="flex items-center gap-3">
            <img
              className="h-6 w-auto"
              src="/logo.svg"
              alt="Company Logo"
            />
          </div>
        </div>
        <nav className="flex flex-1 flex-col bg-gradient-to-b from-indigo-700 to-indigo-600 -mx-6 px-6 h-full relative">
          <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1633976976526-f1e6b0d06dd9')] opacity-[0.03] mix-blend-overlay pointer-events-none" />
          <ul role="list" className="flex flex-1 flex-col gap-y-7">
            {allowedItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.href;

              return (
                <li key={item.name}>
                  <Link
                    to={item.href}
                    className={cn(
                      'group relative flex gap-x-3 rounded-lg p-2 pl-4 text-sm leading-6 transition-all duration-300',
                      'hover:bg-white/15 hover:shadow-lg hover:shadow-indigo-500/10',
                      'before:absolute before:inset-0 before:rounded-lg before:bg-gradient-to-r',
                      'before:from-transparent before:to-transparent before:opacity-0',
                      'hover:before:from-white/5 hover:before:to-transparent hover:before:opacity-100',
                      'before:transition-opacity before:duration-300',
                      isActive
                        ? 'bg-white/10 text-white font-medium'
                        : 'text-indigo-100 hover:text-white font-medium'
                    )}
                  >
                    <Icon
                      className={cn(
                        'h-6 w-6 shrink-0',
                        'transition-all duration-300 group-hover:scale-110 group-hover:rotate-3',
                        isActive
                          ? 'text-white'
                          : 'text-indigo-200 group-hover:text-white'
                      )}
                    />
                    <span className="font-medium tracking-wide">{item.name}</span>
                    {isActive && (
                      <>
                        <span className="absolute left-0 inset-y-2 w-1 bg-white rounded-r-full shadow-[0_0_8px_rgba(255,255,255,0.5)] animate-slide-in" />
                      </>
                    )}
                  </Link>
                </li>
              );
            })}
            <li className="mt-auto pb-4">
              <div className="rounded-lg bg-gradient-to-br from-indigo-800/80 to-indigo-700/80 p-4 shadow-lg shadow-indigo-900/20 border border-white/5">
                <div className="flex items-center gap-4">
                  <div className="h-8 w-8 rounded-full bg-gradient-to-br from-white/20 to-white/10 flex items-center justify-center ring-2 ring-white/10">
                    <span className="text-white text-sm font-medium">
                      {currentUser?.name?.[0]?.toUpperCase() || '?'}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-white truncate tracking-wide">
                      {currentUser?.name || 'User'}
                    </p>
                    <p className="text-xs text-indigo-200/80 truncate">
                      {currentUser?.email || ''}
                    </p>
                  </div>
                </div>
              </div>
            </li>
          </ul>
        </nav>
      </SheetContent>
    </Sheet>
  );
}