import React from 'react';
import { PayrollRecord, Employee } from '../../types/hr';
import { X, Printer, Download, CheckCircle2 } from 'lucide-react';
import { formatMoney } from '../../utils/format';

interface PaystubModalProps {
  record: PayrollRecord;
  employee?: Employee;
  onClose: () => void;
}

export const PaystubModal: React.FC<PaystubModalProps> = ({ record, employee, onClose }) => {
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white rounded-xl shadow-2xl border border-neutral-200 w-full max-w-2xl overflow-hidden max-h-[90vh] flex flex-col">
        {/* Modal Top Bar */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-200 bg-neutral-50/50">
          <div className="flex items-center gap-2">
            <span className="text-base font-semibold text-neutral-900">Earnings Statement & Paystub</span>
            <span className="text-xs text-neutral-500 font-mono">[{record.id}]</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-neutral-700 bg-white border border-neutral-300 rounded-lg hover:bg-neutral-50 transition-colors cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 rounded-lg transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Printable Paystub Body */}
        <div className="p-8 overflow-y-auto space-y-6 text-sm text-neutral-800">
          {/* Header */}
          <div className="flex justify-between items-start border-b border-neutral-200 pb-5">
            <div>
              <h2 className="text-xl font-bold tracking-tight text-neutral-950">ISOFT TECHNOLOGIES INC.</h2>
              <p className="text-xs text-neutral-500 mt-0.5">500 Howard Street, Suite 400 · San Francisco, CA 94105</p>
              <p className="text-xs text-neutral-500">Employer Identification No: 94-3829104</p>
            </div>
            <div className="text-right">
              <span className="text-xs uppercase tracking-wider text-neutral-500 font-semibold block">Pay Period</span>
              <span className="text-base font-bold text-neutral-900 font-mono">{record.payPeriod}</span>
              <p className="text-xs text-neutral-500 mt-1">Payment Date: {record.paymentDate}</p>
            </div>
          </div>

          {/* Employee & Payment Metadata Grid */}
          <div className="grid grid-cols-2 gap-4 p-4 bg-neutral-50 rounded-lg border border-neutral-200/80">
            <div>
              <span className="text-xs text-neutral-500 block">Employee Name</span>
              <span className="font-semibold text-neutral-900">{record.employeeName}</span>
              <span className="text-xs text-neutral-500 block mt-1">
                ID: {employee?.employeeCode || 'EMP-101'} · Role: {record.role}
              </span>
              <span className="text-xs text-neutral-500 block">Department: {record.department}</span>
            </div>
            <div className="text-right">
              <span className="text-xs text-neutral-500 block">Disbursement Channel</span>
              <span className="font-semibold text-neutral-900">{record.paymentMethod}</span>
              <span className="text-xs text-neutral-500 block mt-1">Status: Paid & Reconciled</span>
              <span className="inline-flex items-center gap-1 text-xs text-emerald-700 font-medium mt-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> Direct ACH Cleared
              </span>
            </div>
          </div>

          {/* Itemized Table */}
          <div className="grid grid-cols-2 gap-6 pt-2">
            {/* Earnings */}
            <div>
              <h4 className="text-xs font-semibold uppercase tracking-wider text-neutral-500 pb-2 border-b border-neutral-200">
                Earnings
              </h4>
              <div className="divide-y divide-neutral-100 text-xs mt-2">
                <div className="flex justify-between py-2">
                  <span className="text-neutral-700">Regular Base Salary</span>
                  <span className="font-mono tabular-nums font-medium text-neutral-900">
                    {formatMoney(record.baseSalary)}
                  </span>
                </div>
                {record.allowances > 0 && (
                  <div className="flex justify-between py-2">
                    <span className="text-neutral-700">Stipend & Transit Allowance</span>
                    <span className="font-mono tabular-nums font-medium text-neutral-900">
                      {formatMoney(record.allowances)}
                    </span>
                  </div>
                )}
                <div className="flex justify-between py-2.5 font-semibold text-neutral-950 border-t border-neutral-200">
                  <span>Gross Earnings</span>
                  <span className="font-mono tabular-nums">{formatMoney(record.grossPay)}</span>
                </div>
              </div>
            </div>

            {/* Deductions */}
            <div>
              <h4 className="text-xs font-semibold uppercase tracking-wider text-neutral-500 pb-2 border-b border-neutral-200">
                Statutory Deductions & Pre-Tax
              </h4>
              <div className="divide-y divide-neutral-100 text-xs mt-2">
                <div className="flex justify-between py-2">
                  <span className="text-neutral-700">Federal & State Tax Withholding</span>
                  <span className="font-mono tabular-nums font-medium text-neutral-900">
                    -{formatMoney(record.taxDeduction)}
                  </span>
                </div>
                {record.benefitsDeduction > 0 && (
                  <div className="flex justify-between py-2">
                    <span className="text-neutral-700">Health, Dental & 401(k) Pre-Tax</span>
                    <span className="font-mono tabular-nums font-medium text-neutral-900">
                      -{formatMoney(record.benefitsDeduction)}
                    </span>
                  </div>
                )}
                <div className="flex justify-between py-2.5 font-semibold text-neutral-950 border-t border-neutral-200">
                  <span>Total Deductions</span>
                  <span className="font-mono tabular-nums">
                    -{formatMoney(record.taxDeduction + record.benefitsDeduction)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Net Pay Callout */}
          <div className="mt-4 p-4 bg-neutral-900 text-white rounded-lg flex items-center justify-between">
            <div>
              <span className="text-xs text-neutral-400 uppercase tracking-wider font-semibold block">Net Deposit Amount</span>
              <span className="text-xs text-neutral-300">Credited to employee bank account</span>
            </div>
            <div className="text-right">
              <span className="text-2xl font-bold font-mono tracking-tight text-white tabular-nums">
                {formatMoney(record.netPay)}
              </span>
              <span className="text-xs text-neutral-400 block font-mono">AED</span>
            </div>
          </div>

          {/* Footer note */}
          <div className="pt-2 text-center text-xs text-neutral-400 border-t border-neutral-200">
            This electronic earnings statement is confidential and generated by ISOFT HR for tax reporting purposes.
          </div>
        </div>
      </div>
    </div>
  );
};
