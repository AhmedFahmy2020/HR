import React from 'react';
import { useHR } from '../../context/HRContext';
import { Avatar } from '../common/Avatar';
import {
  Users,
  Clock,
  CalendarDays,
  CircleDollarSign,
  Briefcase,
  CheckCircle,
  XCircle,
  ArrowRight,
  TrendingUp,
  MapPin,
  Calendar
} from 'lucide-react';
import { NavTab } from '../layout/Sidebar';
import { formatMoney } from '../../utils/format';
import { AVATAR_DAVID, AVATAR_ELENA, AVATAR_SARAH } from '../../data/initialData';

interface OverviewDashboardProps {
  onNavigate: (tab: NavTab) => void;
  onOpenNewEmployee: () => void;
  onOpenNewLeave: () => void;
}

export const OverviewDashboard: React.FC<OverviewDashboardProps> = ({
  onNavigate,
  onOpenNewEmployee,
  onOpenNewLeave,
}) => {
  const {
    employees,
    activeUser,
    currentRole,
    permissions,
    leaveRequests,
    attendanceRecords,
    payrollRecords,
    jobPostings,
    announcements,
    approveLeaveRequest,
    rejectLeaveRequest,
  } = useHR();

  // Metrics
  const totalEmployees = employees.length;
  const activeCount = employees.filter((e) => e.status === 'active').length;
  const onLeaveCount = employees.filter((e) => e.status === 'on_leave').length;

  const todayStr = '2026-10-03';
  const todayRecords = attendanceRecords.filter((a) => a.date === todayStr);
  const presentCount = todayRecords.filter((a) => a.status === 'present' || a.status === 'late').length;
  const attendanceRate = totalEmployees > 0 ? Math.round((presentCount / totalEmployees) * 100) : 0;

  const pendingLeaves = leaveRequests.filter((l) => l.status === 'pending');
  const myLeaves = leaveRequests.filter((l) => l.employeeId === activeUser.id);
  const openJobs = jobPostings.filter((j) => j.status === 'open');

  const totalMonthlyPayroll = employees.reduce((acc, emp) => acc + Math.round(emp.salary / 12), 0);
  const myMonthlyGross = Math.round(activeUser.salary / 12);

  // Department counts
  const deptCounts: Record<string, number> = {};
  employees.forEach((emp) => {
    deptCounts[emp.department] = (deptCounts[emp.department] || 0) + 1;
  });

  const remainingPTO = activeUser.leaveBalances.annualTotal - activeUser.leaveBalances.annualUsed;

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-12">
      {/* Top Banner with date & role-aware greetings */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-xl border border-neutral-200/80 shadow-xs">
        <div>
          <span className="text-xs font-semibold text-neutral-400 uppercase tracking-wider">
            {currentRole === 'employee'
              ? 'Employee Self-Service Workspace'
              : currentRole === 'leader'
              ? 'Team Leadership & Operations'
              : 'Workforce Intelligence & Executive Operations'}
          </span>
          <h2 className="text-xl font-bold text-neutral-900 tracking-tight mt-0.5">
            Good morning, {activeUser.name.split(' ')[0]}. Here is your personnel overview.
          </h2>
          <p className="text-xs text-neutral-500 mt-1">
            Friday, October 3, 2026 · {presentCount} team members online
            {permissions.canApproveLeaves ? ` · ${pendingLeaves.length} approvals pending` : ` · ${remainingPTO} PTO days remaining`}
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <button
            onClick={onOpenNewLeave}
            className="px-3.5 py-2 text-xs font-medium text-neutral-700 bg-neutral-100 hover:bg-neutral-200/80 rounded-lg transition-colors cursor-pointer"
          >
            Submit Leave
          </button>
          {permissions.canManageEmployees && (
            <button
              onClick={onOpenNewEmployee}
              className="px-3.5 py-2 text-xs font-medium text-white bg-neutral-900 hover:bg-neutral-800 rounded-lg transition-colors cursor-pointer shadow-xs"
            >
              Add New Hire
            </button>
          )}
        </div>
      </div>

      {/* Primary KPI Grid (Adapts to Role) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1 */}
        <div
          onClick={() => onNavigate('employees')}
          className="bg-white p-5 rounded-xl border border-neutral-200/80 hover:border-neutral-300 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between text-neutral-500 mb-2">
            <span className="text-xs font-medium">Workforce Network</span>
            <Users className="w-4 h-4 text-neutral-400 group-hover:text-neutral-700 transition-colors" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold font-mono tabular-nums text-neutral-900 tracking-tight">
              {totalEmployees}
            </span>
            <span className="text-xs text-neutral-500">colleagues active</span>
          </div>
          <div className="mt-3 text-xs text-neutral-400 flex items-center justify-between pt-2 border-t border-neutral-100">
            <span>Explore team directory</span>
            <ArrowRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
        </div>

        {/* KPI 2: Attendance / Personal Clock */}
        <div
          onClick={() => onNavigate('attendance')}
          className="bg-white p-5 rounded-xl border border-neutral-200/80 hover:border-neutral-300 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between text-neutral-500 mb-2">
            <span className="text-xs font-medium">
              {currentRole === 'employee' ? 'My Presence Today' : "Today's Attendance"}
            </span>
            <Clock className="w-4 h-4 text-neutral-400 group-hover:text-neutral-700 transition-colors" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold font-mono tabular-nums text-neutral-900 tracking-tight">
              {currentRole === 'employee' ? 'Active' : `${attendanceRate}%`}
            </span>
            <span className="text-xs text-neutral-500">
              {currentRole === 'employee' ? `${activeUser.workMode} status` : `${presentCount} of ${totalEmployees} logged in`}
            </span>
          </div>
          <div className="mt-3 text-xs text-neutral-400 flex items-center justify-between pt-2 border-t border-neutral-100">
            <span>Digital timesheet log</span>
            <ArrowRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
        </div>

        {/* KPI 3: Leaves */}
        <div
          onClick={() => onNavigate('leaves')}
          className="bg-white p-5 rounded-xl border border-neutral-200/80 hover:border-neutral-300 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between text-neutral-500 mb-2">
            <span className="text-xs font-medium">
              {permissions.canApproveLeaves ? 'Pending Time Off' : 'My Annual PTO'}
            </span>
            <CalendarDays className="w-4 h-4 text-neutral-400 group-hover:text-neutral-700 transition-colors" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold font-mono tabular-nums text-neutral-900 tracking-tight">
              {permissions.canApproveLeaves ? pendingLeaves.length : remainingPTO}
            </span>
            <span className="text-xs text-neutral-500">
              {permissions.canApproveLeaves ? 'pending review' : `days available (${activeUser.leaveBalances.annualUsed} used)`}
            </span>
          </div>
          <div className="mt-3 text-xs text-neutral-400 flex items-center justify-between pt-2 border-t border-neutral-100">
            <span>{permissions.canApproveLeaves ? 'Review applications' : 'View leave history'}</span>
            <ArrowRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
        </div>

        {/* KPI 4: Financial Commitments OR Personal Pay */}
        <div
          onClick={() => onNavigate('payroll')}
          className="bg-white p-5 rounded-xl border border-neutral-200/80 hover:border-neutral-300 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between text-neutral-500 mb-2">
            <span className="text-xs font-medium">
              {permissions.canManagePayroll ? 'Monthly Payroll Run' : 'My Monthly Earnings'}
            </span>
            <CircleDollarSign className="w-4 h-4 text-neutral-400 group-hover:text-neutral-700 transition-colors" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold font-mono tabular-nums text-neutral-900 tracking-tight">
              {permissions.canManagePayroll
                ? `AED ${(totalMonthlyPayroll / 1000).toFixed(1)}k`
                : formatMoney(myMonthlyGross)}
            </span>
            <span className="text-xs text-neutral-500">
              {permissions.canManagePayroll ? 'est. gross payroll' : 'gross base pay'}
            </span>
          </div>
          <div className="mt-3 text-xs text-neutral-400 flex items-center justify-between pt-2 border-t border-neutral-100">
            <span>{permissions.canManagePayroll ? 'Disbursement ledger' : 'View paystub slip'}</span>
            <ArrowRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
        </div>
      </div>

      {/* Main Grid: Approvals Queue (or My Leaves for Employees) & Real-Time Presence */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Approvals Action Queue (2 cols) */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-neutral-200/80 p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-4 border-b border-neutral-100">
              <div>
                <h3 className="text-base font-bold text-neutral-900 tracking-tight">
                  {permissions.canApproveLeaves ? 'Action Required: Leave Approvals' : 'My Time Off & Leave Applications'}
                </h3>
                <p className="text-xs text-neutral-500 mt-0.5">
                  {permissions.canApproveLeaves
                    ? 'Team members requesting absence approvals'
                    : 'Track your personal leave requests and approval status'}
                </p>
              </div>
              <button
                onClick={() => onNavigate('leaves')}
                className="text-xs font-semibold text-neutral-900 hover:underline flex items-center gap-1 cursor-pointer"
              >
                <span>View all</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>

            {permissions.canApproveLeaves ? (
              pendingLeaves.length === 0 ? (
                <div className="py-12 text-center text-neutral-400 text-xs">
                  <CheckCircle className="w-8 h-8 text-neutral-300 mx-auto mb-2" />
                  All pending leave requests have been reviewed and resolved.
                </div>
              ) : (
                <div className="divide-y divide-neutral-100">
                  {pendingLeaves.map((req) => (
                    <div key={req.id} className="py-4 flex items-center justify-between gap-4">
                      <div className="flex items-center gap-3 min-w-0">
                        <Avatar src={req.avatarUrl} name={req.employeeName} size="md" />
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-neutral-900 truncate">
                              {req.employeeName}
                            </span>
                            <span className="text-xs text-neutral-400">·</span>
                            <span className="text-xs text-neutral-500 font-medium">
                              {req.department}
                            </span>
                          </div>
                          <p className="text-xs text-neutral-600 truncate mt-0.5 font-normal">
                            <span className="capitalize font-semibold text-neutral-900">{req.type} leave</span> · {req.days} {req.days === 1 ? 'day' : 'days'} ({req.startDate} to {req.endDate})
                          </p>
                          <p className="text-xs text-neutral-400 italic truncate mt-0.5">
                            "{req.reason}"
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          onClick={() => rejectLeaveRequest(req.id)}
                          className="px-2.5 py-1.5 text-xs font-medium text-rose-700 bg-rose-50 hover:bg-rose-100 rounded-lg transition-colors cursor-pointer border border-rose-200"
                          title="Decline request"
                        >
                          Decline
                        </button>
                        <button
                          onClick={() => approveLeaveRequest(req.id)}
                          className="px-3 py-1.5 text-xs font-semibold text-white bg-neutral-900 hover:bg-neutral-800 rounded-lg transition-colors cursor-pointer shadow-xs"
                          title="Approve request"
                        >
                          Approve
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )
            ) : (
              /* Regular Employee Self-Service Leaves List */
              <div className="divide-y divide-neutral-100 py-2">
                {myLeaves.length === 0 ? (
                  <div className="py-8 text-center text-neutral-400 text-xs">
                    No active leave requests submitted.
                  </div>
                ) : (
                  myLeaves.map((req) => (
                    <div key={req.id} className="py-3 flex items-center justify-between text-xs">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-neutral-900 capitalize">{req.type} Leave</span>
                          <span className="text-neutral-400">·</span>
                          <span className="font-mono">{req.startDate} to {req.endDate}</span>
                        </div>
                        <p className="text-neutral-500 mt-0.5">{req.reason}</p>
                      </div>
                      <span className={`font-semibold capitalize text-xs px-2 py-0.5 rounded ${
                        req.status === 'approved' ? 'bg-emerald-50 text-emerald-700' : req.status === 'pending' ? 'bg-amber-50 text-amber-700' : 'bg-rose-50 text-rose-700'
                      }`}>
                        {req.status}
                      </span>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>

          {/* Department Headcount Bar */}
          <div className="pt-6 border-t border-neutral-100 mt-4">
            <span className="text-xs font-semibold text-neutral-500 block mb-2">
              Workforce Distribution by Department
            </span>
            <div className="h-3 w-full bg-neutral-100 rounded-full overflow-hidden flex">
              <div
                style={{ width: `${((deptCounts['Engineering'] || 0) / totalEmployees) * 100}%` }}
                className="bg-indigo-600 h-full"
                title={`Engineering: ${deptCounts['Engineering'] || 0}`}
              />
              <div
                style={{ width: `${((deptCounts['Product & Design'] || 0) / totalEmployees) * 100}%` }}
                className="bg-violet-500 h-full"
                title={`Product & Design: ${deptCounts['Product & Design'] || 0}`}
              />
              <div
                style={{ width: `${((deptCounts['People & HR'] || 0) / totalEmployees) * 100}%` }}
                className="bg-emerald-500 h-full"
                title={`People & HR: ${deptCounts['People & HR'] || 0}`}
              />
              <div
                style={{ width: `${((deptCounts['Marketing'] || 0) / totalEmployees) * 100}%` }}
                className="bg-amber-500 h-full"
                title={`Marketing: ${deptCounts['Marketing'] || 0}`}
              />
              <div
                style={{ width: `${((deptCounts['Sales'] || 0) / totalEmployees) * 100}%` }}
                className="bg-sky-500 h-full"
                title={`Sales: ${deptCounts['Sales'] || 0}`}
              />
              <div
                style={{ width: `${((deptCounts['Finance & Operations'] || 0) / totalEmployees) * 100}%` }}
                className="bg-slate-700 h-full"
                title={`Finance & Ops: ${deptCounts['Finance & Operations'] || 0}`}
              />
            </div>

            <div className="flex flex-wrap gap-4 text-xs text-neutral-500 mt-2.5">
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-indigo-600" /> Engineering ({deptCounts['Engineering'] || 0})
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-violet-500" /> Product ({deptCounts['Product & Design'] || 0})
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500" /> HR ({deptCounts['People & HR'] || 0})
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-amber-500" /> Marketing ({deptCounts['Marketing'] || 0})
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-sky-500" /> Sales ({deptCounts['Sales'] || 0})
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-slate-700" /> Ops ({deptCounts['Finance & Operations'] || 0})
              </span>
            </div>
          </div>
        </div>

        {/* Live Attendance / Today Roster (1 col) */}
        <div className="bg-white rounded-xl border border-neutral-200/80 p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-4 border-b border-neutral-100">
              <div>
                <h3 className="text-base font-bold text-neutral-900 tracking-tight">
                  Today's Roster
                </h3>
                <p className="text-xs text-neutral-500 mt-0.5">Real-time check-in status</p>
              </div>
              <button
                onClick={() => onNavigate('attendance')}
                className="text-xs font-semibold text-neutral-900 hover:underline cursor-pointer"
              >
                Timesheets
              </button>
            </div>

            <div className="divide-y divide-neutral-100 mt-1 max-h-80 overflow-y-auto pr-1">
              {todayRecords.map((att) => {
                const emp = employees.find((e) => e.id === att.employeeId);
                const isOnline = att.status === 'present' || att.status === 'late';

                return (
                  <div key={att.id} className="py-2.5 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <Avatar src={emp?.avatarUrl} name={att.employeeName} size="sm" />
                      <div className="truncate">
                        <p className="font-semibold text-neutral-900 truncate">{att.employeeName}</p>
                        <p className="text-neutral-400 capitalize">{att.location}</p>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <span
                        className={`font-mono tabular-nums font-semibold block ${
                          isOnline ? 'text-emerald-700' : 'text-neutral-400'
                        }`}
                      >
                        {att.clockIn || 'On Leave'}
                      </span>
                      <span className="text-neutral-400 text-xs capitalize">{att.status}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Quick Recruitment Spotlight */}
          <div className="pt-4 border-t border-neutral-100 mt-4">
            <div className="flex items-center justify-between text-xs mb-2">
              <span className="font-semibold text-neutral-800">Talent Acquisition</span>
              <button
                onClick={() => onNavigate('recruitment')}
                className="text-neutral-900 font-semibold hover:underline cursor-pointer"
              >
                ATS Pipeline →
              </button>
            </div>
            <div className="p-3 bg-neutral-50 rounded-lg border border-neutral-200/70 text-xs">
              <div className="flex justify-between font-medium text-neutral-900">
                <span>{openJobs.length} Active Job Listings</span>
                <span className="font-mono tabular-nums">45 Total Applicants</span>
              </div>
              <p className="text-neutral-500 mt-1 text-xs">
                DevOps Engineer, Product Marketing Lead, Customer Success
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Announcements & Upcoming Milestones Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Company Announcements */}
        <div className="bg-white rounded-xl border border-neutral-200/80 p-6">
          <div className="flex items-center justify-between pb-4 border-b border-neutral-100 mb-4">
            <div>
              <h3 className="text-base font-bold text-neutral-900 tracking-tight">
                Company Announcements
              </h3>
              <p className="text-xs text-neutral-500 mt-0.5">Policy changes, town halls & benefits</p>
            </div>
            <button
              onClick={() => onNavigate('company')}
              className="text-xs font-semibold text-neutral-900 hover:underline cursor-pointer"
            >
              Post Notice
            </button>
          </div>

          <div className="space-y-4">
            {announcements.slice(0, 2).map((ann) => (
              <div key={ann.id} className="p-3.5 bg-neutral-50 rounded-lg border border-neutral-200/80 text-xs">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="font-bold text-neutral-900">{ann.title}</span>
                  <span className="text-neutral-400 font-mono">{ann.date}</span>
                </div>
                <p className="text-neutral-600 leading-relaxed">{ann.content}</p>
                <div className="mt-2 text-neutral-400 text-xs flex items-center gap-1.5">
                  <span>Posted by {ann.author}</span>
                  <span>·</span>
                  <span>{ann.authorRole}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Work Anniversaries & Upcoming Events */}
        <div className="bg-white rounded-xl border border-neutral-200/80 p-6">
          <div className="flex items-center justify-between pb-4 border-b border-neutral-100 mb-4">
            <div>
              <h3 className="text-base font-bold text-neutral-900 tracking-tight">
                Work Anniversaries & Milestones
              </h3>
              <p className="text-xs text-neutral-500 mt-0.5">Celebrating team dedication</p>
            </div>
          </div>

          <div className="space-y-3 text-xs">
            <div className="flex items-center justify-between p-3 bg-neutral-50 rounded-lg border border-neutral-200/70">
              <div className="flex items-center gap-3">
                <Avatar name="David Sterling" size="sm" src={AVATAR_DAVID} />
                <div>
                  <span className="font-semibold text-neutral-900">David Sterling</span>
                  <p className="text-neutral-500">6 Year Work Anniversary</p>
                </div>
              </div>
              <span className="font-mono tabular-nums text-neutral-500">April 2026</span>
            </div>

            <div className="flex items-center justify-between p-3 bg-neutral-50 rounded-lg border border-neutral-200/70">
              <div className="flex items-center gap-3">
                <Avatar name="Elena Rostova" size="sm" src={AVATAR_ELENA} />
                <div>
                  <span className="font-semibold text-neutral-900">Elena Rostova</span>
                  <p className="text-neutral-500">3 Year Work Anniversary</p>
                </div>
              </div>
              <span className="font-mono tabular-nums text-neutral-500">January 2026</span>
            </div>

            <div className="flex items-center justify-between p-3 bg-neutral-50 rounded-lg border border-neutral-200/70">
              <div className="flex items-center gap-3">
                <Avatar name="Sarah Jenkins" size="sm" src={AVATAR_SARAH} />
                <div>
                  <span className="font-semibold text-neutral-900">Sarah Jenkins</span>
                  <p className="text-neutral-500">4 Year Work Anniversary</p>
                </div>
              </div>
              <span className="font-mono tabular-nums text-neutral-500">March 2026</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
