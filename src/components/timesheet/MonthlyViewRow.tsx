import { useState } from 'react';
import { ChevronRight, ChevronDown } from 'lucide-react';
import { formatDate } from '@/lib/utils/date';
import { Button } from '@/components/ui/Button';

interface MonthlyViewRowProps {
  clientGroup: {
    client: { id: string; name: string };
    totalHours: number;
    projects: Map<string, {
      project: { id: string; name: string };
      totalHours: number;
      entries: Array<{
        date: string;
        hours: number;
        role: { name: string };
      }>;
    }>;
  };
}

export function MonthlyViewRow({ clientGroup }: MonthlyViewRowProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="divide-y divide-gray-100">
      {/* Client Row */}
      <div className="p-4 flex items-center justify-between hover:bg-gray-50">
        <div className="flex items-center">
          <Button
            variant="ghost"
            size="sm"
            className="mr-2"
            onClick={() => setIsExpanded(!isExpanded)}
          >
            {isExpanded ? (
              <ChevronDown className="h-4 w-4" />
            ) : (
              <ChevronRight className="h-4 w-4" />
            )}
          </Button>
          <span className="font-medium">{clientGroup.client.name}</span>
        </div>
        <span className="text-sm">
          <span className="text-gray-500">Total Hours:</span>
          <span className="ml-1 font-medium">{clientGroup.totalHours.toFixed(2)}</span>
        </span>
      </div>

      {/* Project Details */}
      {isExpanded && Array.from(clientGroup.projects.values()).map(projectGroup => (
        <div key={projectGroup.project.id} className="pl-12 divide-y divide-gray-100">
          {/* Project Summary */}
          <div className="p-4 bg-gray-50 flex justify-between items-center">
            <span className="font-medium">{projectGroup.project.name}</span>
            <span className="text-sm">
              <span className="text-gray-500">Total Hours:</span>
              <span className="ml-1 font-medium">{projectGroup.totalHours.toFixed(2)}</span>
            </span>
          </div>

          {/* Time Entries */}
          <div className="divide-y divide-gray-100">
            {projectGroup.entries.map((entry, index) => (
              <div key={index} className="p-4 pl-8 flex justify-between items-center text-sm">
                <div>
                  <span className="text-gray-500">{formatDate(entry.date)}</span>
                  <span className="mx-2">·</span>
                  <span>{entry.role.name}</span>
                </div>
                <span>
                  <span className="text-gray-500">Hours:</span>
                  <span className="ml-1 font-medium">{entry.hours.toFixed(2)}</span>
                </span>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}