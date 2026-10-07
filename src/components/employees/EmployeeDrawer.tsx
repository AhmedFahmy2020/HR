import React, { useState } from 'react';
import { Employee, Department, EmploymentType, WorkMode, EmployeeStatus, UserRole } from '../../types/hr';
import { useHR } from '../../context/HRContext';
import { ROLE_META, ROLE_ORDER } from '../../utils/roles';
import { Avatar } from '../common/Avatar';
import {
  X,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Briefcase,
  DollarSign,
  ShieldAlert,
  Edit2,
  Check,
  Trash2,
  Clock,
  Sparkles
} from 'lucide-react';
import { formatMoney } from '../../utils/format';

interface EmployeeDrawerProps {
  employee: Employee | null;
  onClose: () => void;
}

export const EmployeeDrawer: React.FC<EmployeeDrawerProps> = ({ employee, onClose }) => {
  const { updateEmployee, deleteEmployee, leaveRequests, payrollRecords, permissions, activeUser } = useHR();
  const [activeTab, setActiveTab] = useState<'profile' | 'compensation' | 'leave' | 'edit'>('profile');

  // Edit form state
  const [editForm, setEditForm] = useState<Partial<Employee>>({});
  const [isSavedNotice, setIsSavedNotice] = useState(false);

  if (!employee) return null;

  const handleStartEdit = () => {
    setEditForm({
      name: employee.name,
      role: employee.role,
      privilegeRole: employee.privilegeRole || 'employee',
      department: employee.department,
      phone: employee.phone,
      location: employee.location,
      salary: employee.salary,
      status: employee.status,
      workMode: employee.workMode,
      employmentType: employee.employmentType,
      notes: employee.notes,
    });
    setActiveTab('edit');
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    updateEmployee(employee.id, editForm);
    setIsSavedNotice(true);
    setTimeout(() => {
      setIsSavedNotice(false);
      setActiveTab('profile');
    }, 800);
  };

  const handleDelete = () => {
    if (confirm(`Are you sure you want to offboard and remove ${employee.name} from the active directory?`)) {
      deleteEmployee(employee.id);
      onClose();
    }
  };

  // Recent leaves for this employee
  const employeeLeaves = leaveRequests.filter((l) => l.employeeId === employee.id);
  const employeePayrolls = payrollRecords.filter((p) => p.employeeId === employee.id);

  const monthlyGross = Math.round(employee.salary / 12);
  const estimatedTax = Math.round(monthlyGross * 0.22);
  const estimatedNet = monthlyGross - estimatedTax;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-neutral-900/50 backdrop-blur-xs flex justify-end">
      <div className="w-full max-w-xl bg-white h-full shadow-2xl flex flex-col border-l border-neutral-200 animate-in slide-in-from-right duration-200">
        {/* Drawer Header */}
        <div className="p-6 border-b border-neutral-200 bg-neutral-50/70">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <Avatar src={employee.avatarUrl} name={employee.name} size="lg" />
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-bold text-neutral-900 tracking-tight">
                    {employee.name}
                  </h3>
                  <span className="text-xs font-mono text-neutral-400 font-medium">
                    {employee.employeeCode}
                  </span>
                </div>
                <p className="text-xs text-neutral-600 font-medium">{employee.role}</p>
                <div className="flex items-center gap-2 text-xs text-neutral-500 mt-1">
                  <span>{employee.department}</span>
                  <span>·</span>
                  <span className="capitalize">{employee.workMode}</span>
                  <span>·</span>
                  <span className="capitalize">{employee.status.replace('_', ' ')}</span>
                </div>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 text-neutral-400 hover:text-neutral-700 hover:bg-neutral-200/50 rounded-lg transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Drawer Navigation Tabs */}
          <div className="flex items-center gap-1 mt-6 border-b border-neutral-200 pb-0">
            <button
              onClick={() => setActiveTab('profile')}
              className={`px-3 py-2 text-xs font-medium border-b-2 -mb-px transition-colors cursor-pointer ${
                activeTab === 'profile'
                  ? 'border-neutral-900 text-neutral-950 font-bold'
                  : 'border-transparent text-neutral-500 hover:text-neutral-900'
              }`}
            >
              Profile & Bio
            </button>
            <button
              onClick={() => setActiveTab('compensation')}
              className={`px-3 py-2 text-xs font-medium border-b-2 -mb-px transition-colors cursor-pointer ${
                activeTab === 'compensation'
                  ? 'border-neutral-900 text-neutral-950 font-bold'
                  : 'border-transparent text-neutral-500 hover:text-neutral-900'
              }`}
            >
              Salary & Comp
            </button>
            <button
              onClick={() => setActiveTab('leave')}
              className={`px-3 py-2 text-xs font-medium border-b-2 -mb-px transition-colors cursor-pointer ${
                activeTab === 'leave'
                  ? 'border-neutral-900 text-neutral-950 font-bold'
                  : 'border-transparent text-neutral-500 hover:text-neutral-900'
              }`}
            >
              Time Off Balances
            </button>
            {permissions.canManageEmployees && (
              <button
                onClick={handleStartEdit}
                className={`px-3 py-2 text-xs font-medium border-b-2 -mb-px transition-colors cursor-pointer flex items-center gap-1 ${
                  activeTab === 'edit'
                    ? 'border-neutral-900 text-neutral-950 font-bold'
                    : 'border-transparent text-neutral-500 hover:text-neutral-900'
                }`}
              >
                <Edit2 className="w-3 h-3" />
                <span>Edit Record</span>
              </button>
            )}
          </div>
        </div>

        {/* Drawer Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 text-xs text-neutral-800">
          {/* TAB 1: Profile & Bio */}
          {activeTab === 'profile' && (
            <div className="space-y-6">
              {/* Contact Information */}
              <div>
                <h4 className="text-xs font-semibold uppercase tracking-wider text-neutral-400 mb-3">
                  Direct Contact & Location
                </h4>
                <div className="bg-neutral-50 rounded-lg p-4 border border-neutral-200/80 space-y-2.5">
                  <div className="flex items-center gap-2.5">
                    <Mail className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
                    <span className="text-neutral-600">Email:</span>
                    <a href={`mailto:${employee.email}`} className="font-medium text-neutral-900 hover:underline">
                      {employee.email}
                    </a>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <Phone className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
                    <span className="text-neutral-600">Phone:</span>
                    <span className="font-mono text-neutral-900 font-medium">{employee.phone}</span>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <MapPin className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
                    <span className="text-neutral-600">Location:</span>
                    <span className="text-neutral-900 font-medium">{employee.location}</span>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <Calendar className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
                    <span className="text-neutral-600">Joined Company:</span>
                    <span className="font-mono text-neutral-900 font-medium">{employee.startDate}</span>
                  </div>
                </div>
              </div>

              {/* Organization & Manager */}
              <div>
                <h4 className="text-xs font-semibold uppercase tracking-wider text-neutral-400 mb-3">
                  Organizational Reporting
                </h4>
                <div className="bg-neutral-50 rounded-lg p-4 border border-neutral-200/80 space-y-2">
                  <div className="flex justify-between">
                    <span className="text-neutral-500">Department</span>
                    <span className="font-medium text-neutral-900">{employee.department}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-neutral-500">Reports To</span>
                    <span className="font-medium text-neutral-900">{employee.managerName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-neutral-500">Employment Type</span>
                    <span className="font-medium text-neutral-900 capitalize">
                      {employee.employmentType.replace('_', ' ')}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-neutral-500">Work Policy</span>
                    <span className="font-medium text-neutral-900 capitalize">{employee.workMode}</span>
                  </div>
                </div>
              </div>

              {/* Emergency Contact */}
              <div>
                <h4 className="text-xs font-semibold uppercase tracking-wider text-neutral-400 mb-3">
                  Designated Emergency Contact
                </h4>
                <div className="bg-neutral-50 rounded-lg p-4 border border-neutral-200/80 space-y-2">
                  <div className="flex justify-between">
                    <span className="text-neutral-500">Contact Name</span>
                    <span className="font-medium text-neutral-900">
                      {employee.emergencyContact.name} ({employee.emergencyContact.relationship})
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-neutral-500">Emergency Phone</span>
                    <span className="font-mono text-neutral-900 font-medium">
                      {employee.emergencyContact.phone}
                    </span>
                  </div>
                </div>
              </div>

              {/* Notes */}
              {employee.notes && (
                <div>
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-neutral-400 mb-2">
                    HR & Performance Notes
                  </h4>
                  <p className="p-3 bg-neutral-50 rounded-lg border border-neutral-200/80 text-neutral-600 leading-relaxed">
                    {employee.notes}
                  </p>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: Compensation & Salary */}
          {activeTab === 'compensation' && (
            !permissions.canViewAllSalaries && employee.id !== activeUser.id ? (
              <div className="p-8 text-center bg-neutral-50 rounded-xl border border-neutral-200 space-y-2">
                <ShieldAlert className="w-8 h-8 text-neutral-400 mx-auto" />
                <h4 className="font-bold text-neutral-900 text-xs">Salary Information is Confidential</h4>
                <p className="text-neutral-500 text-xs leading-relaxed max-w-sm mx-auto">
                  Compensation benchmarks, tax deductions, and disbursements for colleagues are restricted to HR administrators and executive leadership.
                </p>
              </div>
            ) : (
            <div className="space-y-6">
              <div className="p-5 bg-neutral-900 text-white rounded-xl">
                <span className="text-xs text-neutral-400 uppercase tracking-wider block font-semibold">
                  Annual Gross Compensation
                </span>
                <div className="flex items-baseline gap-2 mt-1">
                  <span className="text-3xl font-bold font-mono tracking-tight tabular-nums">
                    {formatMoney(employee.salary)}
                  </span>
                  <span className="text-xs text-neutral-400">AED / Year</span>
                </div>
                <p className="text-xs text-neutral-400 mt-2">
                  Direct ACH disbursement scheduled semi-monthly on the 15th and last business day.
                </p>
              </div>

              <div>
                <h4 className="text-xs font-semibold uppercase tracking-wider text-neutral-400 mb-3">
                  Monthly Pro-Rated Breakdown
                </h4>
                <div className="bg-neutral-50 rounded-lg p-4 border border-neutral-200/80 divide-y divide-neutral-200/70">
                  <div className="flex justify-between py-2">
                    <span className="text-neutral-600">Monthly Gross Base</span>
                    <span className="font-mono tabular-nums font-semibold text-neutral-900">
                      {formatMoney(monthlyGross)}
                    </span>
                  </div>
                  <div className="flex justify-between py-2">
                    <span className="text-neutral-600">Transit & Wellness Stipend</span>
                    <span className="font-mono tabular-nums font-semibold text-neutral-900">
                      {formatMoney(employee.employmentType === 'full_time' ? 400 : 0)}
                    </span>
                  </div>
                  <div className="flex justify-between py-2">
                    <span className="text-neutral-600">Est. Federal & State Tax</span>
                    <span className="font-mono tabular-nums text-neutral-600">
                      -{formatMoney(estimatedTax)}
                    </span>
                  </div>
                  <div className="flex justify-between py-2.5 font-bold text-neutral-900">
                    <span>Est. Monthly Net Take-Home</span>
                    <span className="font-mono tabular-nums text-emerald-700">
                      {formatMoney(estimatedNet)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Past Payroll Stubs */}
              <div>
                <h4 className="text-xs font-semibold uppercase tracking-wider text-neutral-400 mb-3">
                  Disbursed Payroll Records
                </h4>
                {employeePayrolls.length === 0 ? (
                  <p className="text-neutral-400 text-xs italic">No past payroll records logged for this year.</p>
                ) : (
                  <div className="space-y-2">
                    {employeePayrolls.map((pay) => (
                      <div
                        key={pay.id}
                        className="flex items-center justify-between p-3 bg-neutral-50 rounded-lg border border-neutral-200/80"
                      >
                        <div>
                          <span className="font-semibold text-neutral-900">{pay.payPeriod}</span>
                          <span className="text-xs text-neutral-400 block font-mono">{pay.paymentDate}</span>
                        </div>
                        <div className="text-right">
                          <span className="font-mono font-bold text-neutral-900 tabular-nums">
                            {formatMoney(pay.netPay)}
                          </span>
                          <span className="text-xs text-emerald-700 block font-medium">Reconciled</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
            )
          )}

          {/* TAB 3: Leave Balances */}
          {activeTab === 'leave' && (
            <div className="space-y-6">
              {/* Balance meters */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {/* Annual */}
                <div className="p-4 bg-neutral-50 rounded-lg border border-neutral-200/80">
                  <span className="text-neutral-500 font-medium block">Annual PTO</span>
                  <div className="flex items-baseline gap-1 my-1">
                    <span className="text-2xl font-bold font-mono tabular-nums text-neutral-900">
                      {employee.leaveBalances.annualTotal - employee.leaveBalances.annualUsed}
                    </span>
                    <span className="text-xs text-neutral-400">/ {employee.leaveBalances.annualTotal} days</span>
                  </div>
                  <div className="w-full bg-neutral-200 h-1.5 rounded-full overflow-hidden">
                    <div
                      className="bg-indigo-600 h-full"
                      style={{
                        width: `${((employee.leaveBalances.annualTotal - employee.leaveBalances.annualUsed) / employee.leaveBalances.annualTotal) * 100}%`,
                      }}
                    />
                  </div>
                  <span className="text-neutral-400 text-xs mt-1 block font-mono">
                    {employee.leaveBalances.annualUsed} used this year
                  </span>
                </div>

                {/* Sick */}
                <div className="p-4 bg-neutral-50 rounded-lg border border-neutral-200/80">
                  <span className="text-neutral-500 font-medium block">Sick Leave</span>
                  <div className="flex items-baseline gap-1 my-1">
                    <span className="text-2xl font-bold font-mono tabular-nums text-neutral-900">
                      {employee.leaveBalances.sickTotal - employee.leaveBalances.sickUsed}
                    </span>
                    <span className="text-xs text-neutral-400">/ {employee.leaveBalances.sickTotal} days</span>
                  </div>
                  <div className="w-full bg-neutral-200 h-1.5 rounded-full overflow-hidden">
                    <div
                      className="bg-emerald-600 h-full"
                      style={{
                        width: `${((employee.leaveBalances.sickTotal - employee.leaveBalances.sickUsed) / employee.leaveBalances.sickTotal) * 100}%`,
                      }}
                    />
                  </div>
                  <span className="text-neutral-400 text-xs mt-1 block font-mono">
                    {employee.leaveBalances.sickUsed} used this year
                  </span>
                </div>

                {/* Personal */}
                <div className="p-4 bg-neutral-50 rounded-lg border border-neutral-200/80">
                  <span className="text-neutral-500 font-medium block">Personal Days</span>
                  <div className="flex items-baseline gap-1 my-1">
                    <span className="text-2xl font-bold font-mono tabular-nums text-neutral-900">
                      {employee.leaveBalances.personalTotal - employee.leaveBalances.personalUsed}
                    </span>
                    <span className="text-xs text-neutral-400">/ {employee.leaveBalances.personalTotal} days</span>
                  </div>
                  <div className="w-full bg-neutral-200 h-1.5 rounded-full overflow-hidden">
                    <div
                      className="bg-amber-600 h-full"
                      style={{
                        width: `${((employee.leaveBalances.personalTotal - employee.leaveBalances.personalUsed) / employee.leaveBalances.personalTotal) * 100}%`,
                      }}
                    />
                  </div>
                  <span className="text-neutral-400 text-xs mt-1 block font-mono">
                    {employee.leaveBalances.personalUsed} used this year
                  </span>
                </div>
              </div>

              {/* Leave Requests Log */}
              <div>
                <h4 className="text-xs font-semibold uppercase tracking-wider text-neutral-400 mb-3">
                  Leave History & Log
                </h4>
                {employeeLeaves.length === 0 ? (
                  <p className="text-neutral-400 text-xs italic">No leave requests recorded for this profile.</p>
                ) : (
                  <div className="space-y-2.5">
                    {employeeLeaves.map((req) => (
                      <div key={req.id} className="p-3 bg-neutral-50 rounded-lg border border-neutral-200/80">
                        <div className="flex items-center justify-between">
                          <span className="font-semibold text-neutral-900 capitalize">
                            {req.type} Leave ({req.days} {req.days === 1 ? 'day' : 'days'})
                          </span>
                          <span
                            className={`font-semibold capitalize text-xs ${
                              req.status === 'approved'
                                ? 'text-emerald-700'
                                : req.status === 'pending'
                                ? 'text-amber-700'
                                : 'text-rose-700'
                            }`}
                          >
                            {req.status}
                          </span>
                        </div>
                        <p className="text-xs text-neutral-500 mt-1 font-mono">
                          {req.startDate} to {req.endDate}
                        </p>
                        <p className="text-xs text-neutral-600 italic mt-1">"{req.reason}"</p>
                        {req.reviewComment && (
                          <p className="text-xs text-neutral-400 mt-1">
                            Note from reviewer: {req.reviewComment}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 4: Edit Details */}
          {activeTab === 'edit' && (
            <form onSubmit={handleSaveEdit} className="space-y-4">
              {isSavedNotice && (
                <div className="p-3 bg-emerald-50 text-emerald-800 rounded-lg border border-emerald-200 flex items-center gap-2">
                  <Check className="w-4 h-4" />
                  <span>Employee record updated successfully!</span>
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-neutral-700 font-semibold mb-1">Full Name</label>
                  <input
                    type="text"
                    value={editForm.name || ''}
                    onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                    className="w-full px-3 py-1.5 bg-neutral-50 border border-neutral-200 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-neutral-700 font-semibold mb-1">Job Title</label>
                  <input
                    type="text"
                    value={editForm.role || ''}
                    onChange={(e) => setEditForm({ ...editForm, role: e.target.value })}
                    className="w-full px-3 py-1.5 bg-neutral-50 border border-neutral-200 rounded-lg"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-neutral-700 font-semibold mb-1">Department</label>
                  <select
                    value={editForm.department || employee.department}
                    onChange={(e) => setEditForm({ ...editForm, department: e.target.value as Department })}
                    className="w-full px-3 py-1.5 bg-neutral-50 border border-neutral-200 rounded-lg"
                  >
                    <option value="Engineering">Engineering</option>
                    <option value="Product & Design">Product & Design</option>
                    <option value="People & HR">People & HR</option>
                    <option value="Marketing">Marketing</option>
                    <option value="Sales">Sales</option>
                    <option value="Finance & Operations">Finance & Operations</option>
                  </select>
                </div>
                <div>
                  <label className="block text-neutral-700 font-semibold mb-1">Status</label>
                  <select
                    value={editForm.status || employee.status}
                    onChange={(e) => setEditForm({ ...editForm, status: e.target.value as EmployeeStatus })}
                    className="w-full px-3 py-1.5 bg-neutral-50 border border-neutral-200 rounded-lg capitalize"
                  >
                    <option value="active">Active</option>
                    <option value="on_leave">On Leave</option>
                    <option value="probation">Probation</option>
                    <option value="offboarded">Offboarded</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-neutral-700 font-semibold mb-1">Annual Salary (AED)</label>
                  <input
                    type="number"
                    value={editForm.salary || employee.salary}
                    onChange={(e) => setEditForm({ ...editForm, salary: Number(e.target.value) })}
                    className="w-full px-3 py-1.5 bg-neutral-50 border border-neutral-200 rounded-lg font-mono"
                  />
                </div>
                <div>
                  <label className="block text-neutral-700 font-semibold mb-1">Work Mode</label>
                  <select
                    value={editForm.workMode || employee.workMode}
                    onChange={(e) => setEditForm({ ...editForm, workMode: e.target.value as WorkMode })}
                    className="w-full px-3 py-1.5 bg-neutral-50 border border-neutral-200 rounded-lg capitalize"
                  >
                    <option value="hybrid">Hybrid</option>
                    <option value="remote">Remote</option>
                    <option value="onsite">Onsite</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-neutral-700 font-semibold mb-1">Privilege & Access Level</label>
                {permissions.canManageUsers ? (
                  <select
                    value={editForm.privilegeRole || employee.privilegeRole || 'employee'}
                    onChange={(e) => setEditForm({ ...editForm, privilegeRole: e.target.value as UserRole })}
                    className="w-full px-3 py-1.5 bg-neutral-50 border border-neutral-200 rounded-lg"
                  >
                    {ROLE_ORDER.map((r) => (
                      <option key={r} value={r}>
                        {ROLE_META[r].label}
                      </option>
                    ))}
                  </select>
                ) : (
                  <p className="w-full px-3 py-1.5 bg-neutral-100 border border-neutral-200 rounded-lg text-neutral-600">
                    {ROLE_META[employee.privilegeRole || 'employee'].label} · managed by a system administrator
                  </p>
                )}
              </div>

              <div>
                <label className="block text-neutral-700 font-semibold mb-1">Location</label>
                <input
                  type="text"
                  value={editForm.location || ''}
                  onChange={(e) => setEditForm({ ...editForm, location: e.target.value })}
                  className="w-full px-3 py-1.5 bg-neutral-50 border border-neutral-200 rounded-lg"
                />
              </div>

              <div>
                <label className="block text-neutral-700 font-semibold mb-1">Internal Notes</label>
                <textarea
                  rows={3}
                  value={editForm.notes || ''}
                  onChange={(e) => setEditForm({ ...editForm, notes: e.target.value })}
                  className="w-full px-3 py-1.5 bg-neutral-50 border border-neutral-200 rounded-lg"
                />
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-neutral-200">
                <button
                  type="button"
                  onClick={handleDelete}
                  className="inline-flex items-center gap-1.5 text-rose-600 hover:text-rose-800 text-xs font-semibold cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Offboard Employee</span>
                </button>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setActiveTab('profile')}
                    className="px-3 py-1.5 text-neutral-600 bg-neutral-100 hover:bg-neutral-200 rounded-lg font-medium cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-1.5 text-white bg-neutral-900 hover:bg-neutral-800 rounded-lg font-semibold cursor-pointer shadow-xs"
                  >
                    Save Changes
                  </button>
                </div>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
