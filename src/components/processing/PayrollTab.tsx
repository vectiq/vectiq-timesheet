import { Card } from '@/components/ui/Card';
import { Table, TableHeader, TableBody, Th, Td } from '@/components/ui/Table';
import { Badge } from '@/components/ui/Badge';
import { formatCurrency } from '@/lib/utils/currency';
import { format, parseISO } from 'date-fns';
import { usePayroll } from '@/lib/hooks/usePayroll';
import { LoadingScreen } from '@/components/ui/LoadingScreen';
import { DollarSign, ChevronDown, ChevronRight, FileText } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/Button';

export function PayrollTab() {
  const { payRuns, calendars, stats, isLoading } = usePayroll({
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

  // Helper function to get calendar info
  const getCalendarInfo = (payRun: any) => {
    const calendar = calendars.find(c => c.PayrollCalendarID === payRun.PayrollCalendarID);
    return calendar ? {
      name: calendar.Name,
      type: calendar.CalendarType,
      referenceDate: calendar.ReferenceDate
    } : null;
  };

  if (isLoading) {
    return <LoadingScreen />;
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
      <Card>
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

      {/* Draft Invoices */}
      <Card>
        <div className="p-6">
          <div className="flex items-center gap-2 mb-6">
            <FileText className="h-5 w-5 text-amber-500" />
            <h3 className="text-lg font-medium text-gray-900">Draft Pay Runs</h3>
          </div>
          
          <div className="space-y-4">
            {payRuns
              .filter(payRun => payRun.PayRunStatus === 'DRAFT')
              .map((payRun) => (
                <div 
                  key={payRun.PayRunID}
                  className="border-b border-gray-200 last:border-0"
                >
                  <div className="py-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => togglePayRun(payRun.PayRunID)}
                          className="p-1 hover:bg-gray-100 rounded"
                        >
                          {expandedPayRuns.has(payRun.PayRunID) ? (
                            <ChevronDown className="h-4 w-4 text-gray-500" />
                          ) : (
                            <ChevronRight className="h-4 w-4 text-gray-500" />
                          )}
                        </Button>
                        <h4 className="text-lg font-medium text-gray-900">
                          {getCalendarInfo(payRun)?.name} - {format(new Date(payRun.PayRunPeriodStartDate), 'MMM d')} - {format(new Date(payRun.PayRunPeriodEndDate), 'MMM d, yyyy')}
                        </h4>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-medium text-gray-500">Net Pay</div>
                        <div className="text-lg font-semibold text-gray-900">
                          {formatCurrency(payRun.NetPay)}
                        </div>
                      </div>
                    </div>
                    <div className="mt-1 ml-9 flex items-center gap-3 text-sm text-gray-500">
                      <span>{payRun.Payslips.length} Employees</span>
                      <span>•</span>
                      <span>Payment Date: {format(new Date(payRun.PaymentDate), 'MMM d, yyyy')}</span>
                      <span>•</span>
                      <Badge variant="warning">DRAFT</Badge>
                      {getCalendarInfo(payRun) && (
                        <>
                          <span>•</span>
                          <Badge variant="secondary">{getCalendarInfo(payRun).type}</Badge>
                        </>
                      )}
                    </div>
                  </div>
                  {/* Expanded Pay Run Details */}
                  {expandedPayRuns.has(payRun.PayRunID) && (
                    <div className="py-4 space-y-6">
                      {/* Summary Cards */}
                      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
                        <div className="bg-gray-50 p-4 rounded-lg">
                          <p className="text-sm font-medium text-gray-600">Wages</p>
                          <p className="mt-2 text-lg font-semibold text-gray-900">
                            {formatCurrency(payRun.Wages)}
                          </p>
                        </div>
                        <div className="bg-gray-50 p-4 rounded-lg">
                          <p className="text-sm font-medium text-gray-600">Tax</p>
                          <p className="mt-2 text-lg font-semibold text-gray-900">
                            {formatCurrency(payRun.Tax)}
                          </p>
                        </div>
                        <div className="bg-gray-50 p-4 rounded-lg">
                          <p className="text-sm font-medium text-gray-600">Super</p>
                          <p className="mt-2 text-lg font-semibold text-gray-900">
                            {formatCurrency(payRun.Super)}
                          </p>
                        </div>
                        <div className="bg-gray-50 p-4 rounded-lg">
                          <p className="text-sm font-medium text-gray-600">Deductions</p>
                          <p className="mt-2 text-lg font-semibold text-gray-900">
                            {formatCurrency(payRun.Deductions)}
                          </p>
                        </div>
                        <div className="bg-gray-50 p-4 rounded-lg">
                          <p className="text-sm font-medium text-gray-600">Reimbursements</p>
                          <p className="mt-2 text-lg font-semibold text-gray-900">
                            {formatCurrency(payRun.Reimbursement)}
                          </p>
                        </div>
                        <div className="bg-gray-50 p-4 rounded-lg">
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
                              <Th>Earnings Type</Th>
                              <Th className="text-right">Units</Th>
                              <Th className="text-right">Rate/Unit</Th>
                              <Th className="text-right">Amount</Th>
                              <Th className="text-right">Tax</Th>
                              <Th className="text-right">Net Pay</Th>
                            </tr>
                          </TableHeader>
                          <TableBody>
                            {payRun.Payslips.map((payslip) => (
                              <>
                                {/* Employee name row */}
                                <tr key={payslip.PayslipID} className="bg-gray-50">
                                  <Td colSpan={6} className="font-medium py-2">
                                    {payslip.FirstName} {payslip.LastName}
                                  </Td>
                                </tr>
                                
                                {/* Timesheet earnings lines */}
                                {payslip.TimesheetEarningsLines?.map((line, index) => (
                                  <tr key={`${payslip.PayslipID}-timesheet-${index}`}>
                                    <Td></Td>
                                    <Td>Timesheet Hours</Td>
                                    <Td className="text-right">{(line.NumberOfUnits || 0).toFixed(1)}</Td>
                                    <Td className="text-right">{formatCurrency(line.RatePerUnit || 0)}</Td>
                                    <Td className="text-right">
                                      {formatCurrency((line.NumberOfUnits || 0) * (line.RatePerUnit || 0))}
                                    </Td>
                                    <Td></Td>
                                    <Td></Td>
                                  </tr>
                                ))}
                                
                                {/* Leave earnings lines */}
                                {payslip.LeaveEarningsLines?.map((line, index) => (
                                  <tr key={`${payslip.PayslipID}-leave-${index}`}>
                                    <Td></Td>
                                    <Td>Leave</Td>
                                    <Td className="text-right">{(line.NumberOfUnits || 0).toFixed(1)}</Td>
                                    <Td className="text-right">{formatCurrency(line.RatePerUnit || 0)}</Td>
                                    <Td className="text-right">
                                      {formatCurrency((line.NumberOfUnits || 0) * (line.RatePerUnit || 0))}
                                    </Td>
                                    <Td></Td>
                                    <Td></Td>
                                  </tr>
                                ))}
                                
                                {/* Regular earnings lines */}
                                {payslip.EarningsLines?.map((line, index) => (
                                  <tr key={`${payslip.PayslipID}-earnings-${index}`}>
                                    <Td></Td>
                                    <Td>{line.EarningsType}</Td>
                                    <Td className="text-right">{(line.NumberOfUnits || 0).toFixed(1)}</Td>
                                    <Td className="text-right">{formatCurrency(line.RatePerUnit || 0)}</Td>
                                    <Td className="text-right">
                                      {formatCurrency((line.NumberOfUnits || 0) * (line.RatePerUnit || 0))}
                                    </Td>
                                    <Td></Td>
                                    <Td></Td>
                                  </tr>
                                ))}
                                
                                {/* Totals row */}
                                <tr className="border-t">
                                  <Td colSpan={4} className="text-right font-medium">
                                    Total
                                  </Td>
                                  <Td className="text-right font-medium">
                                    {formatCurrency(
                                      (payslip.TimesheetEarningsLines?.reduce(
                                        (sum, line) => sum + (line.NumberOfUnits * line.RatePerUnit),
                                        0
                                      ) || 0) +
                                      (payslip.LeaveEarningsLines?.reduce(
                                        (sum, line) => sum + (line.NumberOfUnits * line.RatePerUnit),
                                        0
                                      ) || 0) +
                                      (payslip.EarningsLines?.reduce(
                                        (sum, line) => sum + (line.NumberOfUnits * line.RatePerUnit),
                                        0
                                      ) || 0)
                                    )}
                                  </Td>
                                  <Td className="text-right font-medium">
                                    {formatCurrency(payslip.Tax)}
                                  </Td>
                                  <Td className="text-right font-medium">
                                    {formatCurrency(payslip.NetPay)}
                                  </Td>
                                </tr>
                              </>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            
            {payRuns.filter(payRun => payRun.PayRunStatus === 'DRAFT').length === 0 && (
              <div className="text-center text-gray-500 py-8">
                No draft pay runs found
              </div>
            )}
          </div>
        </div>
      </Card>

      {/* Pay Runs */}
      <Card>
        <div className="p-6">
          <div className="flex items-center gap-2 mb-6">
            <DollarSign className="h-5 w-5 text-green-500" />
            <h3 className="text-lg font-medium text-gray-900">Posted Pay Runs</h3>
          </div>
          
          <div className="divide-y divide-gray-200">
            {payRuns
              .filter(payRun => payRun.PayRunStatus === 'POSTED')
              .map((payRun) => {
              const isExpanded = expandedPayRuns.has(payRun.PayRunID);
              
              return (
                <div key={payRun.PayRunID}>
                  {/* Pay Run Header */}
                  <div className="py-4">
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
                            {getCalendarInfo(payRun)?.name} - {format(new Date(payRun.PayRunPeriodStartDate), 'MMM d')} - {format(new Date(payRun.PayRunPeriodEndDate), 'MMM d, yyyy')}
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
                            {getCalendarInfo(payRun) && (
                              <>
                                <span>•</span>
                                <Badge variant="secondary">{getCalendarInfo(payRun).type}</Badge>
                                <span>•</span>
                                <span>{getCalendarInfo(payRun).name}</span>
                              </>
                            )}
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
                    <div className="py-4 space-y-6">
                      {/* Summary Cards */}
                      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
                        <div className="bg-gray-50 p-4 rounded-lg">
                          <p className="text-sm font-medium text-gray-600">Wages</p>
                          <p className="mt-2 text-lg font-semibold text-gray-900">
                            {formatCurrency(payRun.Wages)}
                          </p>
                        </div>
                        <div className="bg-gray-50 p-4 rounded-lg">
                          <p className="text-sm font-medium text-gray-600">Tax</p>
                          <p className="mt-2 text-lg font-semibold text-gray-900">
                            {formatCurrency(payRun.Tax)}
                          </p>
                        </div>
                        <div className="bg-gray-50 p-4 rounded-lg">
                          <p className="text-sm font-medium text-gray-600">Super</p>
                          <p className="mt-2 text-lg font-semibold text-gray-900">
                            {formatCurrency(payRun.Super)}
                          </p>
                        </div>
                        <div className="bg-gray-50 p-4 rounded-lg">
                          <p className="text-sm font-medium text-gray-600">Deductions</p>
                          <p className="mt-2 text-lg font-semibold text-gray-900">
                            {formatCurrency(payRun.Deductions)}
                          </p>
                        </div>
                        <div className="bg-gray-50 p-4 rounded-lg">
                          <p className="text-sm font-medium text-gray-600">Reimbursements</p>
                          <p className="mt-2 text-lg font-semibold text-gray-900">
                            {formatCurrency(payRun.Reimbursement)}
                          </p>
                        </div>
                        <div className="bg-gray-50 p-4 rounded-lg">
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
                              <Th>Earnings Type</Th>
                              <Th className="text-right">Units</Th>
                              <Th className="text-right">Rate/Unit</Th>
                              <Th className="text-right">Amount</Th>
                              <Th className="text-right">Tax</Th>
                              <Th className="text-right">Net Pay</Th>
                            </tr>
                          </TableHeader>
                          <TableBody>
                            {payRun.Payslips.map((payslip) => (
                              <>
                                {/* Employee name row */}
                                <tr key={payslip.PayslipID} className="bg-gray-50">
                                  <Td colSpan={6} className="font-medium py-2">
                                    {payslip.FirstName} {payslip.LastName}
                                  </Td>
                                </tr>
                                
                                {/* Timesheet earnings lines */}
                                {payslip.TimesheetEarningsLines?.map((line, index) => (
                                  <tr key={`${payslip.PayslipID}-timesheet-${index}`}>
                                    <Td></Td>
                                    <Td>Timesheet Hours</Td>
                                    <Td className="text-right">{(line.NumberOfUnits || 0).toFixed(1)}</Td>
                                    <Td className="text-right">{formatCurrency(line.RatePerUnit || 0)}</Td>
                                    <Td className="text-right">
                                      {formatCurrency((line.NumberOfUnits || 0) * (line.RatePerUnit || 0))}
                                    </Td>
                                    <Td></Td>
                                    <Td></Td>
                                  </tr>
                                ))}
                                
                                {/* Leave earnings lines */}
                                {payslip.LeaveEarningsLines?.map((line, index) => (
                                  <tr key={`${payslip.PayslipID}-leave-${index}`}>
                                    <Td></Td>
                                    <Td>Leave</Td>
                                    <Td className="text-right">{(line.NumberOfUnits || 0).toFixed(1)}</Td>
                                    <Td className="text-right">{formatCurrency(line.RatePerUnit || 0)}</Td>
                                    <Td className="text-right">
                                      {formatCurrency((line.NumberOfUnits || 0) * (line.RatePerUnit || 0))}
                                    </Td>
                                    <Td></Td>
                                    <Td></Td>
                                  </tr>
                                ))}
                                
                                {/* Regular earnings lines */}
                                {payslip.EarningsLines?.map((line, index) => (
                                  <tr key={`${payslip.PayslipID}-earnings-${index}`}>
                                    <Td></Td>
                                    <Td>{line.EarningsType}</Td>
                                    <Td className="text-right">{(line.NumberOfUnits || 0).toFixed(1)}</Td>
                                    <Td className="text-right">{formatCurrency(line.RatePerUnit || 0)}</Td>
                                    <Td className="text-right">
                                      {formatCurrency((line.NumberOfUnits || 0) * (line.RatePerUnit || 0))}
                                    </Td>
                                    <Td></Td>
                                    <Td></Td>
                                  </tr>
                                ))}
                                
                                {/* Totals row */}
                                <tr className="border-t">
                                  <Td colSpan={4} className="text-right font-medium">
                                    Total
                                  </Td>
                                  <Td className="text-right font-medium">
                                    {formatCurrency(
                                      (payslip.TimesheetEarningsLines?.reduce(
                                        (sum, line) => sum + (line.NumberOfUnits * line.RatePerUnit),
                                        0
                                      ) || 0) +
                                      (payslip.LeaveEarningsLines?.reduce(
                                        (sum, line) => sum + (line.NumberOfUnits * line.RatePerUnit),
                                        0
                                      ) || 0) +
                                      (payslip.EarningsLines?.reduce(
                                        (sum, line) => sum + (line.NumberOfUnits * line.RatePerUnit),
                                        0
                                      ) || 0)
                                    )}
                                  </Td>
                                  <Td className="text-right font-medium">
                                    {formatCurrency(payslip.Tax)}
                                  </Td>
                                  <Td className="text-right font-medium">
                                    {formatCurrency(payslip.NetPay)}
                                  </Td>
                                </tr>
                              </>
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
        </div>
      </Card>
    </div>
  );
}