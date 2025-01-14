import { useState } from 'react';
import { ReportFilters } from './ReportFilters';
import { ReportTable } from './ReportTable';
import { ReportSummary } from './ReportSummary';
import { useReports } from '@/lib/hooks/useReports';
import { LoadingScreen } from '@/components/ui/LoadingScreen';
import { Button } from '@/components/ui/Button';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import type { ReportFilters as ReportFiltersType } from '@/types';

const ITEMS_PER_PAGE = 50;

interface TimeReportProps {
  filters: ReportFiltersType;
  onFiltersChange: (filters: ReportFiltersType) => void;
}

export function TimeReport({ filters, onFiltersChange }: TimeReportProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const { data, isLoading } = useReports({ ...filters, type: 'time' });

  if (isLoading) {
    return <LoadingScreen />;
  }

  // Calculate pagination
  const totalPages = Math.ceil((data?.entries?.length || 0) / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const currentEntries = data?.entries?.slice(startIndex, endIndex) || [];

  return (
    <div className="space-y-6">
      <ReportFilters filters={filters} onChange={onFiltersChange} />
      <ReportSummary data={data?.summary} />
      <ReportTable data={currentEntries} approvals={data?.approvals} />
      
      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between border-t border-gray-200 bg-white px-4 py-3 sm:px-6">
          <div className="flex flex-1 justify-between sm:hidden">
            <Button
              variant="secondary"
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
            >
              Previous
            </Button>
            <Button
              variant="secondary"
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
            >
              Next
            </Button>
          </div>
          <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-gray-700">
                Showing <span className="font-medium">{startIndex + 1}</span> to{' '}
                <span className="font-medium">
                  {Math.min(endIndex, data?.entries?.length || 0)}
                </span>{' '}
                of <span className="font-medium">{data?.entries?.length}</span> results
              </p>
            </div>
            <div>
              <nav className="isolate inline-flex -space-x-px rounded-md shadow-sm" aria-label="Pagination">
                <Button
                  variant="secondary"
                  className="rounded-l-md"
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                  <Button
                    key={page}
                    variant={page === currentPage ? 'primary' : 'secondary'}
                    className="rounded-none"
                    onClick={() => setCurrentPage(page)}
                  >
                    {page}
                  </Button>
                ))}
                <Button
                  variant="secondary"
                  className="rounded-r-md"
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </nav>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}