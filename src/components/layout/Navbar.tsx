import { Bell } from 'lucide-react';
import { MobileNav } from './MobileNav';
import { UserMenu } from './UserMenu';

export function Navbar() {
  return (
    <nav className="fixed top-0 z-40 w-full bg-white border-b border-gray-200">
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 justify-between">
          <div className="flex">
            <MobileNav />
          </div>
          
          <div className="flex items-center gap-x-4">
            <button
              type="button"
              className="rounded-full bg-white p-1.5 text-gray-400 hover:text-gray-500"
            >
              <span className="sr-only">View notifications</span>
              <Bell className="h-5 w-5" aria-hidden="true" />
            </button>

            <UserMenu />
          </div>
        </div>
      </div>
    </nav>
  );
}