import { Search, Filter } from 'lucide-react';
import { Button } from '@/components/ui/Button';

export function ProcessingFilters() {
  return (
    <div className="flex justify-between items-center">
      <div className="flex items-center gap-4">
        <div className="relative">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search projects..."
            className="pl-9 block w-64 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          />
        </div>
        
        <select className="rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500">
          <option>All Clients</option>
        </select>
        
        <select className="rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500">
          <option>All Statuses</option>
        </select>
      </div>

      <div className="flex items-center gap-2">
        <Button variant="secondary">
          <Filter className="h-4 w-4 mr-2" />
          More Filters
        </Button>
      </div>
    </div>
  );
}