import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/Sheet';
import { Menu } from 'lucide-react';
import { navigationItems } from '@/lib/constants/navigation';
import { Link, useLocation } from 'react-router-dom';

export function MobileNav() {
  const location = useLocation();

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
        <div className="flex h-16 shrink-0 items-center">
          <img
            className="h-8 w-auto"
            src="https://tailwindui.com/img/logos/mark.svg?color=indigo&shade=600"
            alt="Your Company"
          />
        </div>
        <nav className="flex flex-1 flex-col">
          <ul role="list" className="flex flex-1 flex-col gap-y-7">
            {navigationItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.href;

              return (
                <li key={item.name}>
                  <Link
                    to={item.href}
                    className={`
                      group flex gap-x-3 rounded-md p-2 text-sm leading-6
                      ${isActive
                        ? 'bg-gray-50 text-indigo-600'
                        : 'text-gray-700 hover:text-indigo-600 hover:bg-gray-50'
                      }
                    `}
                  >
                    <Icon
                      className={`h-6 w-6 shrink-0 ${
                        isActive ? 'text-indigo-600' : 'text-gray-400 group-hover:text-indigo-600'
                      }`}
                    />
                    {item.name}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
      </SheetContent>
    </Sheet>
  );
}