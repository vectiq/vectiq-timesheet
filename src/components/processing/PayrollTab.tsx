import { Card } from '@/components/ui/Card';

export function PayrollTab() {
  return (
    <Card>
      <div className="p-12 text-center">
        <h3 className="text-lg font-medium text-gray-900">
          Payroll Processing Coming Soon
        </h3>
        <p className="mt-2 text-sm text-gray-500">
          This feature is currently under development. Check back soon for updates.
        </p>
      </div>
    </Card>
  );
}