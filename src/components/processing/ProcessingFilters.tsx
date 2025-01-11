import { useState, useCallback } from 'react';
import { Search, Filter, X, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { FormField } from '@/components/ui/FormField';
import { Card } from '@/components/ui/Card';
import { useClients } from '@/lib/hooks/useClients';
import { cn } from '@/lib/utils/styles';

interface ProcessingFiltersProps {
  onFilterChange: (filters: {
    search: string;
    clientId: string;
    status: string;
    priority: string;
    type: string;
  }) => void;
}

export function ProcessingFilters({ onFilterChange }: ProcessingFiltersProps) {
  const { clients } = useClients();
  const [isExpanded, setIsExpanded] = useState(false);
  const [search, setSearch] = useState('');
  const [clientId, setClientId] = useState('');
  const [status, setStatus] = useState('');
  const [priority, setPriority] = useState('');
  const [type, setType] = useState('');

  const handleSearchChange = useCallback((value: string) => {
    setSearch(value);
    onFilterChange({
      search: value,
      clientId,
      status,
      priority,
      type
    });
  }, [clientId, status, priority, type, onFilterChange]);

  const handleClientChange = useCallback((value: string) => {
    setClientId(value);
    onFilterChange({
      search,
      clientId: value,
      status,
      priority,
      type
    });
  }, [search, status, priority, type, onFilterChange]);

  const handleStatusChange = useCallback((value: string) => {
    setStatus(value);
    onFilterChange({
      search,
      clientId,
      status: value,
      priority,
      type
    });
  }, [search, clientId, priority, type, onFilterChange]);

  const handlePriorityChange = useCallback((value: string) => {
    setPriority(value);
    onFilterChange({
      search,
      clientId,
      status,
      priority: value,
      type
    });
  }, [search, clientId, status, type, onFilterChange]);

  const handleTypeChange = useCallback((value: string) => {
    setType(value);
    onFilterChange({
      search,
      clientId,
      status,
      priority,
      type: value
    });
  }, [search, clientId, status, priority, onFilterChange]);

  const clearFilters = useCallback(() => {
    setSearch('');
    setClientId('');
    setStatus('');
    setPriority('');
    setType('');
    onFilterChange({
      search: '',
      clientId: '',
      status: '',
      priority: '',
      type: ''
    });
  }, [onFilterChange]);

  const hasActiveFilters = search || clientId || status || priority || type;

  return (
    <div className="space-y-4">
      <div className="flex flex-col lg:flex-row gap-4">
        {/* Search */}
        <div className="relative flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
            <Input
              type="text"
              placeholder="Search projects or clients..."
              value={search}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="pl-10 h-11 text-base"
            />
          </div>
        </div>

        {/* Quick Filters */}
        <div className="flex flex-wrap gap-3">
          <div className="relative min-w-[180px]">
            <Select
              value={clientId}
              onChange={(e) => handleClientChange(e.target.value)}
            >
              <option value="">All Clients</option>
              {clients.map(client => (
                <option key={client.id} value={client.id}>
                  {client.name}
                </option>
              ))}
            </Select>
            <ChevronDown className="absolute right-3 top-3.5 h-4 w-4 text-gray-500 pointer-events-none" />
          </div>

          <div className="relative min-w-[160px]">
            <Select
              value={status}
              onChange={(e) => handleStatusChange(e.target.value)}
            >
              <option value="">All Statuses</option>
              <option value="not started">Not Started</option>
              <option value="draft">Draft</option>
              <option value="sent">Sent</option>
            </Select>
            <ChevronDown className="absolute right-3 top-3.5 h-4 w-4 text-gray-500 pointer-events-none" />
          </div>

          <Button
            variant="secondary"
            onClick={() => setIsExpanded(!isExpanded)}
            className={cn(
              "h-11 border border-gray-200 shadow-sm hover:bg-gray-50 transition-colors",
              isExpanded && "bg-gray-50 border-gray-300"
            )}
          >
            <Filter className="h-4 w-4 mr-2" />
            More Filters
          </Button>

          {hasActiveFilters && (
            <Button
              variant="secondary"
              onClick={clearFilters}
              className="h-11 border border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300 transition-colors"
            >
              <X className="h-4 w-4 mr-2" />
              Clear Filters
            </Button>
          )}
        </div>
      </div>

      {/* Advanced Filters */}
      {isExpanded && (
        <Card className="p-6 border border-gray-200 shadow-sm bg-white/50 backdrop-blur-sm">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="space-y-2">
              <FormField label="Priority">
                <Select
                  value={priority}
                  onChange={(e) => handlePriorityChange(e.target.value)}
                >
                  <option value="">All Priorities</option>
                  <option value="high">High</option>
                  <option value="normal">Normal</option>
                </Select>
              </FormField>
            </div>

            <div className="space-y-2">
              <FormField label="Project Type">
                <Select
                  value={type}
                  onChange={(e) => handleTypeChange(e.target.value)}
                >
                  <option value="">All Types</option>
                  <option value="labor_hire">Labor Hire</option>
                  <option value="team">Team Project</option>
                </Select>
              </FormField>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}