import React, { useState } from 'react';
import { useHR } from '../../context/HRContext';
import { LeaveType, LeaveStatus } from '../../types/hr';
import { Avatar } from '../common/Avatar';
import {
  CalendarDays,
  CheckCircle,
  XCircle,
  Clock,
  Plus,
  Filter,
  AlertCircle,
  X,
  ShieldCheck
} from 'lucide-react';

interface LeaveManagementProps {
  isModalOpen: boolean;
  setIsModalOpen: (open: boolean) => void;
}

export const LeaveManagement: React.FC<LeaveManagementProps> = ({
  isModalOpen,
  setIsModalOpen,
}) => {
  const {
    leaveRequests,
    employees,
    activeUser,
    currentRole,
    permissions,
    submitLeaveRequest,
    approveLeaveRequest,
    rejectLeaveRequest,
  } = useHR();

  const [statusFilter, setStatusFilter] = useState<'all' | LeaveStatus>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [scopeFilter, setScopeFilter] = useState<'all' | 'mine' | 'team'>(() => {
    return currentRole === 'employee' ? 'mine' : currentRole === 'leader' ? 'team' : 'all';
  });

  // Submit modal form state
  const [formEmployeeId, setFormEmployeeId] = useState(activeUser.id);
  const [formType, setFormType] = useState<LeaveType>('annual');
  const [formStartDate, setFormStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [formEndDate, setFormEndDate] = useState(new Date().toISOString().split('T')[0]);
  const [formReason, setFormReason] = useState('');
  const [formError, setFormError] = useState('');

  // Filtering
  const filteredRequests = leaveRequests.filter((req) => {
    const matchStatus = statusFilter === 'all' || req.status === statusFilter;
    const matchType = typeFilter === 'all' || req.type === typeFilter;
    
    let matchScope = true;
    if (scopeFilter === 'mine') {
      matchScope = req.employeeId === activeUser.id;
    } else if (scopeFilter === 'team') {
      matchScope = req.department === activeUser.department;
    }

    return matchStatus && matchType && matchScope;
  });

  const pendingCount = leaveRequests.filter((l) => l.status === 'pending').length;
  const approvedCount = leaveRequests.filter((l) => l.status === 'approved').length;
  const rejectedCount = leaveRequests.filter((l) => l.status === 'rejected').length;

  const myRequests = leaveRequests.filter((l) => l.employeeId === activeUser.id);
  const myPendingCount = myRequests.filter((l) => l.status === 'pending').length;
  const teamRequests = leaveRequests.filter((l) => l.department === activeUser.department);
  const teamPendingCount = teamRequests.filter((l) => l.status === 'pending').length;

  const remainingPTO = activeUser.leaveBalances.annualTotal - activeUser.leaveBalances.annualUsed;
  const remainingSick = activeUser.leaveBalances.sickTotal - activeUser.leaveBalances.sickUsed;

  const canApproveThisRequest = (req: (typeof leaveRequests)[0]) => {
    if (!permissions.canApproveLeaves) return false;
    if (currentRole === 'leader') {
      return req.department === activeUser.department;
    }
    if (currentRole === 'cto') {
      return req.department === 'Engineering' || req.department === 'Product & Design' || req.department === activeUser.department;
    }
    return true; // hr and ceo can approve all
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formStartDate || !formEndDate) {
      setFormError('Please select both start and end dates');
      return;
    }
    if (new Date(formStartDate) > new Date(formEndDate)) {
      setFormError('Start date must be before end date');
      return;
    }
    if (!formReason.trim()) {
      setFormError('Please provide a reason for the absence');
      return;
    }

    submitLeaveRequest({
      employeeId: formEmployeeId,
      type: formType,
      startDate: formStartDate,
      endDate: formEndDate,
      reason: formReason.trim(),
    });

    setFormReason('');
    setFormError('');
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Active Privilege Banner & Scope Filter */}
      <div className="bg-neutral-50/80 border border-neutral-200/90 rounded-xl px-4 py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-neutral-700" />
          <span className="font-semibold text-neutral-900">
            Leave Authority: <span className="capitalize">{currentRole}</span>
          </span>
          <span className="text-neutral-500 hidden md:inline">
            {currentRole === 'employee'
              ? '· Self-service absence submissions & personal allowance tracking'
              : currentRole === 'leader'
              ? `· Approver for ${activeUser.department} department requests`
              : currentRole === 'cto'
              ? '· Technical engineering organization approvals'
              : '· Full enterprise absence approvals & global quota management'}
          </span>
        </div>

        {/* Scope Selector */}
        <div className="flex items-center gap-1 bg-neutral-200/70 p-0.5 rounded-lg text-xs self-start sm:self-auto">
          {permissions.canApproveLeaves && (
            <button
              onClick={() => setScopeFilter('all')}
              className={`px-2.5 py-1 rounded-md font-medium cursor-pointer transition-colors ${
                scopeFilter === 'all' ? 'bg-white text-neutral-900 font-bold shadow-2xs' : 'text-neutral-600 hover:text-neutral-900'
              }`}
            >
              All Company ({leaveRequests.length})
            </button>
          )}
          {currentRole !== 'employee' && (
            <button
              onClick={() => setScopeFilter('team')}
              className={`px-2.5 py-1 rounded-md font-medium cursor-pointer transition-colors ${
                scopeFilter === 'team' ? 'bg-white text-neutral-900 font-bold shadow-2xs' : 'text-neutral-600 hover:text-neutral-900'
              }`}
            >
              {activeUser.department} Team ({teamRequests.length})
            </button>
          )}
          <button
            onClick={() => setScopeFilter('mine')}
            className={`px-2.5 py-1 rounded-md font-medium cursor-pointer transition-colors ${
              scopeFilter === 'mine' ? 'bg-white text-neutral-900 font-bold shadow-2xs' : 'text-neutral-600 hover:text-neutral-900'
            }`}
          >
            My Requests ({myRequests.length})
          </button>
        </div>
      </div>

      {/* Metrics Row (Tailored to Role) */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {currentRole === 'employee' ? (
          <>
            <div className="bg-white p-5 rounded-xl border border-neutral-200/80 shadow-xs">
              <div className="flex items-center justify-between text-neutral-500 mb-1">
                <span className="text-xs font-medium">My Vacation Balance</span>
                <CalendarDays className="w-4 h-4 text-emerald-600" />
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-bold font-mono tabular-nums text-neutral-900">
                  {remainingPTO}
                </span>
                <span className="text-xs text-neutral-500">of {activeUser.leaveBalances.annualTotal} days available</span>
              </div>
            </div>

            <div className="bg-white p-5 rounded-xl border border-neutral-200/80 shadow-xs">
              <div className="flex items-center justify-between text-neutral-500 mb-1">
                <span className="text-xs font-medium">My Sick Leave Quota</span>
                <CheckCircle className="w-4 h-4 text-sky-600" />
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-bold font-mono tabular-nums text-neutral-900">
                  {remainingSick}
                </span>
                <span className="text-xs text-neutral-500">of {activeUser.leaveBalances.sickTotal} days left</span>
              </div>
            </div>

            <div className="bg-white p-5 rounded-xl border border-neutral-200/80 shadow-xs">
              <div className="flex items-center justify-between text-neutral-500 mb-1">
                <span className="text-xs font-medium">My Pending Applications</span>
                <Clock className="w-4 h-4 text-amber-500" />
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-bold font-mono tabular-nums text-neutral-900">
                  {myPendingCount}
                </span>
                <span className="text-xs text-neutral-500">awaiting supervisor review</span>
              </div>
            </div>
          </>
        ) : currentRole === 'leader' ? (
          <>
            <div className="bg-white p-5 rounded-xl border border-neutral-200/80 shadow-xs">
              <div className="flex items-center justify-between text-neutral-500 mb-1">
                <span className="text-xs font-medium">Team Pending Approvals</span>
                <Clock className="w-4 h-4 text-amber-500" />
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-bold font-mono tabular-nums text-neutral-900">
                  {teamPendingCount}
                </span>
                <span className="text-xs text-neutral-500">in {activeUser.department}</span>
              </div>
            </div>

            <div className="bg-white p-5 rounded-xl border border-neutral-200/80 shadow-xs">
              <div className="flex items-center justify-between text-neutral-500 mb-1">
                <span className="text-xs font-medium">Team Total Requests</span>
                <CalendarDays className="w-4 h-4 text-sky-600" />
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-bold font-mono tabular-nums text-neutral-900">
                  {teamRequests.length}
                </span>
                <span className="text-xs text-neutral-500">department total</span>
              </div>
            </div>

            <div className="bg-white p-5 rounded-xl border border-neutral-200/80 shadow-xs">
              <div className="flex items-center justify-between text-neutral-500 mb-1">
                <span className="text-xs font-medium">My Personal PTO</span>
                <CheckCircle className="w-4 h-4 text-emerald-500" />
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-bold font-mono tabular-nums text-neutral-900">
                  {remainingPTO}
                </span>
                <span className="text-xs text-neutral-500">days available</span>
              </div>
            </div>
          </>
        ) : (
          <>
            <div className="bg-white p-5 rounded-xl border border-neutral-200/80 shadow-xs">
              <div className="flex items-center justify-between text-neutral-500 mb-1">
                <span className="text-xs font-medium">Company Pending Review</span>
                <Clock className="w-4 h-4 text-amber-500" />
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-bold font-mono tabular-nums text-neutral-900">
                  {pendingCount}
                </span>
                <span className="text-xs text-neutral-500">enterprise-wide awaiting decision</span>
              </div>
            </div>

            <div className="bg-white p-5 rounded-xl border border-neutral-200/80 shadow-xs">
              <div className="flex items-center justify-between text-neutral-500 mb-1">
                <span className="text-xs font-medium">Approved Leaves</span>
                <CheckCircle className="w-4 h-4 text-emerald-500" />
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-bold font-mono tabular-nums text-neutral-900">
                  {approvedCount}
                </span>
                <span className="text-xs text-neutral-500">recorded this cycle</span>
              </div>
            </div>

            <div className="bg-white p-5 rounded-xl border border-neutral-200/80 shadow-xs">
              <div className="flex items-center justify-between text-neutral-500 mb-1">
                <span className="text-xs font-medium">Declined</span>
                <XCircle className="w-4 h-4 text-neutral-400" />
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-bold font-mono tabular-nums text-neutral-900">
                  {rejectedCount}
                </span>
                <span className="text-xs text-neutral-500">rescheduled</span>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Control Bar & Filter Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 rounded-xl border border-neutral-200/80 shadow-xs">
        {/* Status segmented controls */}
        <div className="flex items-center gap-1 p-1 bg-neutral-100 rounded-lg">
          <button
            onClick={() => setStatusFilter('all')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors cursor-pointer ${
              statusFilter === 'all'
                ? 'bg-white text-neutral-900 shadow-xs font-semibold'
                : 'text-neutral-600 hover:text-neutral-950'
            }`}
          >
            All Requests ({leaveRequests.length})
          </button>
          <button
            onClick={() => setStatusFilter('pending')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors cursor-pointer ${
              statusFilter === 'pending'
                ? 'bg-white text-neutral-900 shadow-xs font-semibold'
                : 'text-neutral-600 hover:text-neutral-950'
            }`}
          >
            Pending ({pendingCount})
          </button>
          <button
            onClick={() => setStatusFilter('approved')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors cursor-pointer ${
              statusFilter === 'approved'
                ? 'bg-white text-neutral-900 shadow-xs font-semibold'
                : 'text-neutral-600 hover:text-neutral-950'
            }`}
          >
            Approved ({approvedCount})
          </button>
          <button
            onClick={() => setStatusFilter('rejected')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors cursor-pointer ${
              statusFilter === 'rejected'
                ? 'bg-white text-neutral-900 shadow-xs font-semibold'
                : 'text-neutral-600 hover:text-neutral-950'
            }`}
          >
            Declined ({rejectedCount})
          </button>
        </div>

        {/* Leave Type selector & New Request button */}
        <div className="flex items-center gap-2">
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="px-3 py-1.5 text-xs bg-neutral-50 border border-neutral-200 rounded-lg text-neutral-700 focus:outline-none cursor-pointer"
          >
            <option value="all">All Leave Categories</option>
            <option value="annual">Annual Vacation</option>
            <option value="sick">Sick Leave</option>
            <option value="personal">Personal Leave</option>
            <option value="parental">Parental</option>
            <option value="unpaid">Unpaid</option>
          </select>

          <button
            onClick={() => setIsModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-neutral-900 hover:bg-neutral-800 rounded-lg transition-colors cursor-pointer shadow-xs"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Submit Request</span>
          </button>
        </div>
      </div>

      {/* Requests Table */}
      <div className="bg-white rounded-xl border border-neutral-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-neutral-200 bg-neutral-50/75 text-neutral-500 uppercase tracking-wider font-semibold">
                <th className="py-3 px-4">Employee</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Duration</th>
                <th className="py-3 px-4">Calendar Range</th>
                <th className="py-3 px-4">Reason / Justification</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {filteredRequests.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-neutral-400">
                    No leave requests found for this filter.
                  </td>
                </tr>
              ) : (
                filteredRequests.map((req) => (
                  <tr key={req.id} className="hover:bg-neutral-50/70 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2.5">
                        <Avatar src={req.avatarUrl} name={req.employeeName} size="sm" />
                        <div>
                          <p className="font-semibold text-neutral-900">{req.employeeName}</p>
                          <p className="text-neutral-500 text-xs">{req.department}</p>
                        </div>
                      </div>
                    </td>

                    <td className="py-3.5 px-4 font-medium capitalize text-neutral-800">
                      {req.type}
                    </td>

                    <td className="py-3.5 px-4 font-mono tabular-nums font-semibold text-neutral-900">
                      {req.days} {req.days === 1 ? 'day' : 'days'}
                    </td>

                    <td className="py-3.5 px-4 font-mono text-neutral-600">
                      {req.startDate} <span className="text-neutral-400">→</span> {req.endDate}
                    </td>

                    <td className="py-3.5 px-4 max-w-xs text-neutral-600 truncate" title={req.reason}>
                      {req.reason}
                    </td>

                    <td className="py-3.5 px-4">
                      <span className="capitalize font-semibold text-xs">
                        {req.status === 'approved' && (
                          <span className="text-emerald-700">Approved</span>
                        )}
                        {req.status === 'pending' && (
                          <span className="text-amber-700">Pending</span>
                        )}
                        {req.status === 'rejected' && (
                          <span className="text-rose-700">Declined</span>
                        )}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      {req.status === 'pending' ? (
                        canApproveThisRequest(req) ? (
                          <div className="inline-flex items-center gap-1.5">
                            <button
                              onClick={() => rejectLeaveRequest(req.id)}
                              className="px-2.5 py-1 text-xs font-medium text-rose-700 bg-rose-50 hover:bg-rose-100 rounded-md transition-colors cursor-pointer border border-rose-200"
                            >
                              Decline
                            </button>
                            <button
                              onClick={() => approveLeaveRequest(req.id)}
                              className="px-2.5 py-1 text-xs font-semibold text-white bg-neutral-900 hover:bg-neutral-800 rounded-md transition-colors cursor-pointer shadow-xs"
                            >
                              Approve
                            </button>
                          </div>
                        ) : (
                          <span className="text-amber-700 font-medium text-xs bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                            {req.employeeId === activeUser.id ? 'Under Review' : `Awaiting ${req.department} Lead`}
                          </span>
                        )
                      ) : (
                        <span className="text-neutral-400 text-xs font-mono">
                          {req.reviewedBy ? `by ${req.reviewedBy.split(' ')[0]}` : 'Resolved'}
                        </span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Submit Leave Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-xl shadow-2xl border border-neutral-200 w-full max-w-lg overflow-hidden flex flex-col">
            <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-200 bg-neutral-50/50">
              <h3 className="text-base font-bold text-neutral-900">Request Time Off</h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 rounded-lg cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleFormSubmit} className="p-6 space-y-4 text-xs">
              {formError && (
                <div className="p-2.5 bg-rose-50 text-rose-700 rounded-lg border border-rose-200 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{formError}</span>
                </div>
              )}

              <div>
                <label className="block font-semibold text-neutral-700 mb-1">Applying Employee</label>
                {currentRole === 'employee' ? (
                  <div className="px-3 py-2 bg-neutral-100 border border-neutral-200 rounded-lg text-neutral-800 font-medium flex items-center justify-between">
                    <span>{activeUser.name} — {activeUser.role}</span>
                    <span className="text-2xs font-mono text-neutral-500 bg-white px-2 py-0.5 rounded border border-neutral-200">
                      {remainingPTO} PTO days remaining
                    </span>
                  </div>
                ) : (
                  <select
                    value={formEmployeeId}
                    onChange={(e) => setFormEmployeeId(e.target.value)}
                    className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-lg"
                  >
                    {employees.map((e) => (
                      <option key={e.id} value={e.id}>
                        {e.name} — {e.department} ({e.leaveBalances.annualTotal - e.leaveBalances.annualUsed} PTO days left)
                      </option>
                    ))}
                  </select>
                )}
              </div>

              <div>
                <label className="block font-semibold text-neutral-700 mb-1">Leave Category</label>
                <select
                  value={formType}
                  onChange={(e) => setFormType(e.target.value as LeaveType)}
                  className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-lg"
                >
                  <option value="annual">Annual Paid Time Off (PTO)</option>
                  <option value="sick">Sick / Medical Leave</option>
                  <option value="personal">Personal Leave</option>
                  <option value="parental">Parental Leave</option>
                  <option value="unpaid">Unpaid Leave</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-neutral-700 mb-1">Start Date</label>
                  <input
                    type="date"
                    value={formStartDate}
                    onChange={(e) => setFormStartDate(e.target.value)}
                    className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-lg font-mono"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-neutral-700 mb-1">End Date</label>
                  <input
                    type="date"
                    value={formEndDate}
                    onChange={(e) => setFormEndDate(e.target.value)}
                    className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-lg font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-neutral-700 mb-1">Reason / Note for Manager</label>
                <textarea
                  rows={3}
                  placeholder="Vacation trip, personal appointment, medical procedure..."
                  value={formReason}
                  onChange={(e) => setFormReason(e.target.value)}
                  className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-lg"
                />
              </div>

              <div className="pt-3 flex justify-end gap-2 border-t border-neutral-200">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-3.5 py-2 text-neutral-600 bg-neutral-100 hover:bg-neutral-200 rounded-lg font-medium cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-white bg-neutral-900 hover:bg-neutral-800 rounded-lg font-semibold cursor-pointer shadow-xs"
                >
                  Submit for Approval
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
