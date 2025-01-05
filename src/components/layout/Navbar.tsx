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
            <UserMenu />
          </div>
        </div>
      </div>
    </nav>
  );
}