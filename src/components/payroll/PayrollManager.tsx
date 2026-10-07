import React, { useState } from 'react';
import { useHR } from '../../context/HRContext';
import { PayrollRecord } from '../../types/hr';
import { Avatar } from '../common/Avatar';
import { PaystubModal } from '../common/PaystubModal';
import {
  CircleDollarSign,
  FileText,
  Download,
  Play,
  CheckCircle,
  Clock,
  ShieldCheck,
  TrendingUp,
  Receipt
} from 'lucide-react';
import { formatMoney } from '../../utils/format';

export const PayrollManager: React.FC = () => {
  const { payrollRecords, runPayrollBatch, exportCSV, employees, permissions, activeUser, currentRole } = useHR();
  const [selectedPaystub, setSelectedPaystub] = useState<PayrollRecord | null>(null);
  const [periodFilter, setPeriodFilter] = useState<string>('all');
  const [isProcessing, setIsProcessing] = useState(false);
  const [successBanner, setSuccessBanner] = useState<string | null>(null);

  // Filter records based on role: HR, CEO, and CTO can view company compensation; Leader and Employee view personal
  const canViewCompanyPayroll = permissions.canManagePayroll || permissions.canViewAllSalaries;
  const baseRecords = canViewCompanyPayroll
    ? payrollRecords
    : payrollRecords.filter((p) => p.employeeId === activeUser.id);

  // If regular employee has no past record yet, provide default current record
  const recordsToDisplay = !permissions.canManagePayroll && baseRecords.length === 0 ? [
    {
      id: `pay-${activeUser.id}-sep`,
      payPeriod: 'September 2026',
      employeeId: activeUser.id,
      employeeName: activeUser.name,
      department: activeUser.department,
      role: activeUser.role,
      baseSalary: Math.round(activeUser.salary / 12),
      allowances: activeUser.employmentType === 'full_time' ? 400 : 0,
      grossPay: Math.round(activeUser.salary / 12) + (activeUser.employmentType === 'full_time' ? 400 : 0),
      taxDeduction: Math.round((activeUser.salary / 12) * 0.22),
      benefitsDeduction: Math.round((activeUser.salary / 12) * 0.045),
      netPay: Math.round(activeUser.salary / 12) * 0.735,
      paymentDate: '2026-09-30',
      status: 'paid' as const,
      paymentMethod: 'Direct Deposit (ACH Transfer)',
    }
  ] : baseRecords;

  // Group by distinct periods
  const periods = Array.from(new Set(recordsToDisplay.map((p) => p.payPeriod)));

  const filteredRecords = recordsToDisplay.filter((rec) => {
    return periodFilter === 'all' || rec.payPeriod === periodFilter;
  });

  // Calculate totals
  const totalGross = filteredRecords.reduce((sum, r) => sum + r.grossPay, 0);
  const totalTax = filteredRecords.reduce((sum, r) => sum + r.taxDeduction, 0);
  const totalBenefits = filteredRecords.reduce((sum, r) => sum + r.benefitsDeduction, 0);
  const totalNet = filteredRecords.reduce((sum, r) => sum + r.netPay, 0);

  const handleRunPayroll = () => {
    const currentPeriod = 'October 2026';
    const alreadyRun = payrollRecords.some((p) => p.payPeriod === currentPeriod);
    if (alreadyRun && !confirm(`${currentPeriod} payroll has already been processed. Re-run batch anyway?`)) {
      return;
    }

    setIsProcessing(true);
    setTimeout(() => {
      runPayrollBatch(currentPeriod);
      setIsProcessing(false);
      setSuccessBanner(`Batch payroll for ${currentPeriod} has been successfully disbursed via ACH!`);
      setTimeout(() => setSuccessBanner(null), 4000);
    }, 700);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Active Privilege Banner */}
      <div className="bg-neutral-50/80 border border-neutral-200/90 rounded-xl px-4 py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-neutral-700" />
          <span className="font-semibold text-neutral-900">
            Compensation Privilege: <span className="capitalize">{currentRole}</span>
          </span>
          <span className="text-neutral-500 hidden md:inline">
            {currentRole === 'employee'
              ? '· Self-service personal paystubs & tax deduction breakdowns'
              : currentRole === 'leader'
              ? '· Team lead view: Personal paystubs & department compensation overview'
              : currentRole === 'cto'
              ? '· Technical executive compensation insights; financial disbursements restricted to HR & CEO'
              : '· Enterprise financial authority: Execute ACH payroll batches & full company salary ledger'}
          </span>
        </div>
        <span className="text-2xs font-mono text-neutral-500 bg-white px-2 py-0.5 rounded border border-neutral-200 self-start sm:self-auto">
          {permissions.canManagePayroll ? 'Disbursement Execution Enabled' : 'View Only Mode'}
        </span>
      </div>

      {/* Top Banner Alert on Payroll execution */}
      {successBanner && (
        <div className="p-4 bg-emerald-50 text-emerald-900 border border-emerald-200 rounded-xl flex items-center justify-between animate-in fade-in duration-150">
          <div className="flex items-center gap-2.5">
            <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0" />
            <span className="text-xs font-semibold">{successBanner}</span>
          </div>
          <button
            onClick={() => setSuccessBanner(null)}
            className="text-xs text-emerald-700 hover:text-emerald-950 font-bold"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Financial Overview Cards (Tabular Numerals) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Gross Wages */}
        <div className="bg-white p-5 rounded-xl border border-neutral-200/80 shadow-xs">
          <div className="flex items-center justify-between text-neutral-400 mb-1">
            <span className="text-xs font-medium text-neutral-600">
              {permissions.canManagePayroll ? 'Total Gross Wages' : 'My Monthly Gross'}
            </span>
            <CircleDollarSign className="w-4 h-4 text-neutral-400" />
          </div>
          <div className="flex items-baseline gap-1 mt-1">
            <span className="text-3xl font-bold font-mono tabular-nums text-neutral-900">
              {formatMoney(totalGross)}
            </span>
          </div>
          <p className="text-xs text-neutral-400 mt-2">
            {permissions.canManagePayroll ? 'Combined salary & stipends' : 'Base salary and monthly stipend'}
          </p>
        </div>

        {/* Tax Withholdings */}
        <div className="bg-white p-5 rounded-xl border border-neutral-200/80 shadow-xs">
          <div className="flex items-center justify-between text-neutral-400 mb-1">
            <span className="text-xs font-medium text-neutral-600">Tax Withholdings</span>
            <Receipt className="w-4 h-4 text-neutral-400" />
          </div>
          <div className="flex items-baseline gap-1 mt-1">
            <span className="text-3xl font-bold font-mono tabular-nums text-neutral-900">
              {formatMoney(totalTax)}
            </span>
          </div>
          <p className="text-xs text-neutral-400 mt-2">Federal, state & FICA</p>
        </div>

        {/* Benefits & Deductions */}
        <div className="bg-white p-5 rounded-xl border border-neutral-200/80 shadow-xs">
          <div className="flex items-center justify-between text-neutral-400 mb-1">
            <span className="text-xs font-medium text-neutral-600">Benefits & 401(k)</span>
            <ShieldCheck className="w-4 h-4 text-neutral-400" />
          </div>
          <div className="flex items-baseline gap-1 mt-1">
            <span className="text-3xl font-bold font-mono tabular-nums text-neutral-900">
              {formatMoney(totalBenefits)}
            </span>
          </div>
          <p className="text-xs text-neutral-400 mt-2">Pre-tax healthcare contributions</p>
        </div>

        {/* Net Direct ACH */}
        <div className="bg-neutral-900 text-white p-5 rounded-xl shadow-xs">
          <div className="flex items-center justify-between text-neutral-400 mb-1">
            <span className="text-xs font-medium text-neutral-300">Net Take-Home</span>
            <TrendingUp className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="flex items-baseline gap-1 mt-1">
            <span className="text-3xl font-bold font-mono tabular-nums text-white">
              {formatMoney(totalNet)}
            </span>
          </div>
          <p className="text-xs text-neutral-400 mt-2">ACH Direct Deposit</p>
        </div>
      </div>

      {/* Control Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 rounded-xl border border-neutral-200/80 shadow-xs">
        <div className="flex items-center gap-3">
          <label className="text-xs text-neutral-500 font-medium">Payroll Cycle:</label>
          <select
            value={periodFilter}
            onChange={(e) => setPeriodFilter(e.target.value)}
            className="px-3 py-1.5 text-xs bg-neutral-50 border border-neutral-200 rounded-lg text-neutral-700 cursor-pointer"
          >
            <option value="all">All Historical Cycles</option>
            {periods.map((p) => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-2">
          {permissions.canManagePayroll && (
            <button
              onClick={() => exportCSV('payroll')}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-neutral-700 bg-white border border-neutral-200 rounded-lg hover:bg-neutral-50 transition-colors cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export Payroll CSV</span>
            </button>
          )}

          {permissions.canManagePayroll && (
            <button
              onClick={handleRunPayroll}
              disabled={isProcessing}
              className="inline-flex items-center gap-1.5 px-4 py-1.5 text-xs font-semibold text-white bg-neutral-900 hover:bg-neutral-800 disabled:opacity-50 rounded-lg transition-colors cursor-pointer shadow-xs"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>{isProcessing ? 'Processing ACH Batch...' : 'Run October 2026 Batch'}</span>
            </button>
          )}
        </div>
      </div>

      {/* Detailed Payroll Ledger Table */}
      <div className="bg-white rounded-xl border border-neutral-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-neutral-200 bg-neutral-50/75 text-neutral-500 uppercase tracking-wider font-semibold">
                <th className="py-3 px-4">Pay Period</th>
                <th className="py-3 px-4">Employee</th>
                <th className="py-3 px-4">Department</th>
                <th className="py-3 px-4 text-right">Base Salary</th>
                <th className="py-3 px-4 text-right">Allowances</th>
                <th className="py-3 px-4 text-right">Gross Pay</th>
                <th className="py-3 px-4 text-right">Tax Deduction</th>
                <th className="py-3 px-4 text-right">Net Take-Home</th>
                <th className="py-3 px-4">Disbursement</th>
                <th className="py-3 px-4 text-center">Paystub</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {filteredRecords.map((rec) => {
                const emp = employees.find((e) => e.id === rec.employeeId);
                return (
                  <tr key={rec.id} className="hover:bg-neutral-50/70 transition-colors">
                    <td className="py-3 px-4 font-mono font-medium text-neutral-800">
                      {rec.payPeriod}
                    </td>

                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2.5">
                        <Avatar src={emp?.avatarUrl} name={rec.employeeName} size="sm" />
                        <div>
                          <p className="font-semibold text-neutral-900">{rec.employeeName}</p>
                          <p className="text-neutral-500 text-xs">{rec.role}</p>
                        </div>
                      </div>
                    </td>

                    <td className="py-3 px-4 text-neutral-600">{rec.department}</td>

                    <td className="py-3 px-4 text-right font-mono tabular-nums text-neutral-900">
                      {formatMoney(rec.baseSalary)}
                    </td>

                    <td className="py-3 px-4 text-right font-mono tabular-nums text-neutral-600">
                      {formatMoney(rec.allowances)}
                    </td>

                    <td className="py-3 px-4 text-right font-mono tabular-nums font-semibold text-neutral-900">
                      {formatMoney(rec.grossPay)}
                    </td>

                    <td className="py-3 px-4 text-right font-mono tabular-nums text-neutral-500">
                      -{formatMoney(rec.taxDeduction)}
                    </td>

                    <td className="py-3 px-4 text-right font-mono tabular-nums font-bold text-emerald-700">
                      {formatMoney(rec.netPay)}
                    </td>

                    <td className="py-3 px-4">
                      <div className="text-xs">
                        <span className="font-medium text-neutral-800 block">
                          {rec.paymentDate}
                        </span>
                        <span className="text-neutral-400 capitalize text-xs">Direct Deposit</span>
                      </div>
                    </td>

                    <td className="py-3 px-4 text-center">
                      <button
                        onClick={() => setSelectedPaystub(rec)}
                        className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-neutral-700 bg-neutral-100 hover:bg-neutral-200/80 rounded-md transition-colors cursor-pointer"
                      >
                        <FileText className="w-3.5 h-3.5 text-neutral-500" />
                        <span>Slip</span>
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Paystub Modal */}
      {selectedPaystub && (
        <PaystubModal
          record={selectedPaystub}
          employee={employees.find((e) => e.id === selectedPaystub.employeeId)}
          onClose={() => setSelectedPaystub(null)}
        />
      )}
    </div>
  );
};
