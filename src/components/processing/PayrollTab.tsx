import { Card } from '@/components/ui/Card';
import { Table, TableHeader, TableBody, Th, Td } from '@/components/ui/Table';
import { Badge } from '@/components/ui/Badge';
import { formatCurrency } from '@/lib/utils/currency';
import { format, parseISO } from 'date-fns';
import { usePayroll } from '@/lib/hooks/usePayroll';
import { LoadingScreen } from '@/components/ui/LoadingScreen';
import { DollarSign, Calendar, Clock, Users, ChevronDown, ChevronRight } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/Button';

export function PayrollTab() {
  const { payRuns, stats, isLoading } = usePayroll({
    selectedDate: new Date(),
    includeStats: true
  });

  const [expandedPayRuns, setExpandedPayRuns] = useState<Set<string>>(new Set());

  const togglePayRun = (payRunId: string) => {
    setExpandedPayRuns(prev => {
      const next = new Set(prev);
      if (next.has(payRunId)) {
        next.delete(payRunId);
      } else {
        next.add(payRunId);
      }
      return next;
    });
  };

  if (isLoading) {
    return <LoadingScreen />;
  }

  if (!payRuns?.length) {
    return (
      <Card className="p-12 text-center">
        <h3 className="text-lg font-medium text-gray-900">
          No Payroll Data Available
        </h3>
        <p className="mt-2 text-sm text-gray-500">
          There is no payroll data available for {format(new Date(), 'MMMM yyyy')}.
        </p>
      </Card>
    );
  }

  // Calculate month totals
  const monthTotals = payRuns.reduce((acc, payRun) => ({
    totalWages: acc.totalWages + payRun.Wages,
    totalTax: acc.totalTax + payRun.Tax,
    totalSuper: acc.totalSuper + payRun.Super,
    totalDeductions: acc.totalDeductions + payRun.Deductions,
    totalReimbursements: acc.totalReimbursements + payRun.Reimbursement,
    totalNetPay: acc.totalNetPay + payRun.NetPay,
    totalEmployees: acc.totalEmployees + payRun.Payslips.length
  }), {
    totalWages: 0,
    totalTax: 0,
    totalSuper: 0,
    totalDeductions: 0,
    totalReimbursements: 0,
    totalNetPay: 0,
    totalEmployees: 0
  });

  return (
    <div className="space-y-6">
      {/* Month Summary */}
      <Card className="bg-gradient-to-br from-indigo-50 to-white">
        <div className="p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-6">Month Summary</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-6">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Wages</p>
              <p className="mt-2 text-xl font-semibold text-gray-900">
                {formatCurrency(monthTotals.totalWages)}
              </p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Total Tax</p>
              <p className="mt-2 text-xl font-semibold text-gray-900">
                {formatCurrency(monthTotals.totalTax)}
              </p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Total Super</p>
              <p className="mt-2 text-xl font-semibold text-gray-900">
                {formatCurrency(monthTotals.totalSuper)}
              </p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Total Deductions</p>
              <p className="mt-2 text-xl font-semibold text-gray-900">
                {formatCurrency(monthTotals.totalDeductions)}
              </p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Total Reimbursements</p>
              <p className="mt-2 text-xl font-semibold text-gray-900">
                {formatCurrency(monthTotals.totalReimbursements)}
              </p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Total Net Pay</p>
              <p className="mt-2 text-xl font-semibold text-indigo-600">
                {formatCurrency(monthTotals.totalNetPay)}
              </p>
            </div>
          </div>
        </div>
      </Card>

      {/* Pay Runs List */}
      <Card>
        <div className="divide-y divide-gray-200">
          {payRuns.map((payRun) => {
            const isExpanded = expandedPayRuns.has(payRun.PayRunID);
            
            return (
              <div key={payRun.PayRunID}>
                {/* Pay Run Header */}
                <div className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => togglePayRun(payRun.PayRunID)}
                        className="p-1 hover:bg-gray-100 rounded"
                      >
                        {isExpanded ? (
                          <ChevronDown className="h-4 w-4 text-gray-500" />
                        ) : (
                          <ChevronRight className="h-4 w-4 text-gray-500" />
                        )}
                      </Button>
                      <div>
                        <h4 className="text-lg font-medium text-gray-900">
                          Pay Run {format(new Date(payRun.PayRunPeriodStartDate), 'MMM d')} - {format(new Date(payRun.PayRunPeriodEndDate), 'MMM d, yyyy')}
                        </h4>
                        <div className="mt-1 flex items-center gap-3 text-sm text-gray-500">
                          <span>{payRun.Payslips.length} Employees</span>
                          <span>•</span>
                          <span>Payment Date: {format(new Date(payRun.PaymentDate), 'MMM d, yyyy')}</span>
                          <span>•</span>
                          <Badge
                            variant={payRun.PayRunStatus === 'POSTED' ? 'success' : 'warning'}
                          >
                            {payRun.PayRunStatus}
                          </Badge>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-medium text-gray-500">Net Pay</div>
                      <div className="text-lg font-semibold text-gray-900">
                        {formatCurrency(payRun.NetPay)}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Expanded Pay Run Details */}
                {isExpanded && (
                  <div className="bg-gray-50 p-6 space-y-6">
                    {/* Summary Cards */}
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
                      <div className="bg-white p-4 rounded-lg shadow-sm">
                        <p className="text-sm font-medium text-gray-600">Wages</p>
                        <p className="mt-2 text-lg font-semibold text-gray-900">
                          {formatCurrency(payRun.Wages)}
                        </p>
                      </div>
                      <div className="bg-white p-4 rounded-lg shadow-sm">
                        <p className="text-sm font-medium text-gray-600">Tax</p>
                        <p className="mt-2 text-lg font-semibold text-gray-900">
                          {formatCurrency(payRun.Tax)}
                        </p>
                      </div>
                      <div className="bg-white p-4 rounded-lg shadow-sm">
                        <p className="text-sm font-medium text-gray-600">Super</p>
                        <p className="mt-2 text-lg font-semibold text-gray-900">
                          {formatCurrency(payRun.Super)}
                        </p>
                      </div>
                      <div className="bg-white p-4 rounded-lg shadow-sm">
                        <p className="text-sm font-medium text-gray-600">Deductions</p>
                        <p className="mt-2 text-lg font-semibold text-gray-900">
                          {formatCurrency(payRun.Deductions)}
                        </p>
                      </div>
                      <div className="bg-white p-4 rounded-lg shadow-sm">
                        <p className="text-sm font-medium text-gray-600">Reimbursements</p>
                        <p className="mt-2 text-lg font-semibold text-gray-900">
                          {formatCurrency(payRun.Reimbursement)}
                        </p>
                      </div>
                      <div className="bg-white p-4 rounded-lg shadow-sm">
                        <p className="text-sm font-medium text-gray-600">Net Pay</p>
                        <p className="mt-2 text-lg font-semibold text-indigo-600">
                          {formatCurrency(payRun.NetPay)}
                        </p>
                      </div>
                    </div>

                    {/* Payslips Table */}
                    <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                      <Table>
                        <TableHeader>
                          <tr>
                            <Th>Employee</Th>
                            <Th className="text-right">Wages</Th>
                            <Th className="text-right">Tax</Th>
                            <Th className="text-right">Super</Th>
                            <Th className="text-right">Deductions</Th>
                            <Th className="text-right">Net Pay</Th>
                          </tr>
                        </TableHeader>
                        <TableBody>
                          {payRun.Payslips.map((payslip) => (
                            <tr key={payslip.PayslipID}>
                              <Td className="font-medium">
                                {payslip.FirstName} {payslip.LastName}
                              </Td>
                              <Td className="text-right">{formatCurrency(payslip.Wages)}</Td>
                              <Td className="text-right">{formatCurrency(payslip.Tax)}</Td>
                              <Td className="text-right">{formatCurrency(payslip.Super)}</Td>
                              <Td className="text-right">{formatCurrency(payslip.Deductions)}</Td>
                              <Td className="text-right font-medium">{formatCurrency(payslip.NetPay)}</Td>
                            </tr>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </Card>
    </div>
  );
}