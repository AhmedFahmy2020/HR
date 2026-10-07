import React, { useState, useEffect } from 'react';
import { useHR } from '../../context/HRContext';
import { Avatar } from '../common/Avatar';
import { AttendanceStatus, WorkMode, Department } from '../../types/hr';
import {
  Clock,
  Play,
  Square,
  Plus,
  Download,
  Calendar,
  CheckCircle2,
  AlertTriangle,
  X,
  ShieldCheck
} from 'lucide-react';

export const AttendanceTracker: React.FC = () => {
  const {
    activeUser,
    currentRole,
    permissions,
    isClockedIn,
    clockInTime,
    elapsedSeconds,
    toggleClock,
    attendanceRecords,
    employees,
    addManualAttendance,
    exportCSV,
  } = useHR();

  const [currentTime, setCurrentTime] = useState(new Date());
  const [filterDept, setFilterDept] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [viewScope, setViewScope] = useState<'all' | 'mine' | 'team'>(() => {
    return currentRole === 'employee' ? 'mine' : currentRole === 'leader' ? 'team' : 'all';
  });
  const [isManualModalOpen, setIsManualModalOpen] = useState(false);

  // Manual record form state
  const [manualEmpId, setManualEmpId] = useState(employees[0]?.id || '');
  const [manualDate, setManualDate] = useState(new Date().toISOString().split('T')[0]);
  const [manualClockIn, setManualClockIn] = useState('09:00 AM');
  const [manualClockOut, setManualClockOut] = useState('05:30 PM');
  const [manualHours, setManualHours] = useState(8.5);
  const [manualStatus, setManualStatus] = useState<AttendanceStatus>('present');
  const [manualNotes, setManualNotes] = useState('');

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const formatElapsed = (sec: number) => {
    const hrs = Math.floor(sec / 3600);
    const mins = Math.floor((sec % 3600) / 60);
    const secs = sec % 60;
    return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const filteredRecords = attendanceRecords.filter((rec) => {
    const matchDept = filterDept === 'all' || rec.department === filterDept;
    const matchStatus = filterStatus === 'all' || rec.status === filterStatus;
    let matchScope = true;
    if (viewScope === 'mine') {
      matchScope = rec.employeeId === activeUser.id;
    } else if (viewScope === 'team') {
      matchScope = rec.department === activeUser.department;
    }
    return matchDept && matchStatus && matchScope;
  });

  const totalHoursLogged = attendanceRecords.reduce((acc, r) => acc + (r.totalHours || 0), 0);
  const totalOvertime = attendanceRecords.reduce((acc, r) => acc + (r.overtimeHours || 0), 0);
  const onTimePercentage = Math.round(
    (attendanceRecords.filter((r) => r.status === 'present').length / (attendanceRecords.length || 1)) * 100
  );

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const emp = employees.find((e) => e.id === manualEmpId);
    if (!emp) return;

    addManualAttendance({
      employeeId: emp.id,
      employeeName: emp.name,
      department: emp.department,
      date: manualDate,
      clockIn: manualClockIn,
      clockOut: manualClockOut,
      totalHours: Number(manualHours),
      overtimeHours: Math.max(0, Number(manualHours) - 8),
      status: manualStatus,
      location: emp.workMode,
      notes: manualNotes.trim() || 'Manual timesheet adjustment',
    });

    setIsManualModalOpen(false);
    setManualNotes('');
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Attendance Privilege Banner */}
      <div className="bg-neutral-50/80 border border-neutral-200/90 rounded-xl px-4 py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-neutral-700" />
          <span className="font-semibold text-neutral-900">
            Attendance Privilege: <span className="capitalize">{currentRole}</span>
          </span>
          <span className="text-neutral-500 hidden md:inline">
            {currentRole === 'employee'
              ? '· Personal shift terminal & own historical timesheet viewing'
              : currentRole === 'leader'
              ? `· Department manager view: ${activeUser.department} team presence`
              : '· Operations oversight: Company-wide punch audits & manual timesheet adjustments'}
          </span>
        </div>

        <div className="flex items-center gap-1 bg-neutral-200/70 p-0.5 rounded-lg text-xs self-start sm:self-auto">
          {permissions.canViewAllTimesheets && (
            <button
              onClick={() => setViewScope('all')}
              className={`px-2.5 py-1 rounded-md font-medium cursor-pointer transition-colors ${
                viewScope === 'all' ? 'bg-white text-neutral-900 font-bold shadow-2xs' : 'text-neutral-600 hover:text-neutral-900'
              }`}
            >
              All Company
            </button>
          )}
          {currentRole !== 'employee' && (
            <button
              onClick={() => setViewScope('team')}
              className={`px-2.5 py-1 rounded-md font-medium cursor-pointer transition-colors ${
                viewScope === 'team' ? 'bg-white text-neutral-900 font-bold shadow-2xs' : 'text-neutral-600 hover:text-neutral-900'
              }`}
            >
              {activeUser.department}
            </button>
          )}
          <button
            onClick={() => setViewScope('mine')}
            className={`px-2.5 py-1 rounded-md font-medium cursor-pointer transition-colors ${
              viewScope === 'mine' ? 'bg-white text-neutral-900 font-bold shadow-2xs' : 'text-neutral-600 hover:text-neutral-900'
            }`}
          >
            My Timesheet
          </button>
        </div>
      </div>
      {/* Interactive Punch Terminal & Live Metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Active Punch Terminal Card */}
        <div className="bg-neutral-900 text-white rounded-xl p-6 shadow-md border border-neutral-800 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs uppercase font-semibold tracking-wider text-neutral-400">
                Personal Time Terminal
              </span>
              <span className="text-xs font-mono text-neutral-400">
                {currentTime.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}
              </span>
            </div>

            <div className="mt-4 flex items-center gap-3">
              <Avatar src={activeUser.avatarUrl} name={activeUser.name} size="md" className="border-neutral-700" />
              <div>
                <p className="font-bold text-sm text-white">{activeUser.name}</p>
                <p className="text-xs text-neutral-400">{activeUser.role} · {activeUser.department}</p>
              </div>
            </div>

            {/* Live Clock Display */}
            <div className="mt-6 p-4 bg-neutral-950 rounded-lg border border-neutral-800 text-center">
              <span className="text-3xl sm:text-4xl font-mono tabular-nums font-bold tracking-tight text-white block">
                {currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
              </span>
              <span className="text-xs text-neutral-500 font-mono mt-1 block">
                {isClockedIn ? `Clocked in at ${clockInTime}` : 'Currently off the clock'}
              </span>
            </div>

            {isClockedIn && (
              <div className="mt-3 flex items-center justify-between text-xs text-neutral-400 px-1">
                <span>Active Session Duration:</span>
                <span className="font-mono font-bold text-emerald-400 tabular-nums">
                  {formatElapsed(elapsedSeconds)}
                </span>
              </div>
            )}
          </div>

          <div className="mt-6">
            <button
              onClick={toggleClock}
              className={`w-full py-3 px-4 rounded-lg font-semibold text-xs transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-sm ${
                isClockedIn
                  ? 'bg-rose-600 hover:bg-rose-500 text-white'
                  : 'bg-emerald-600 hover:bg-emerald-500 text-white'
              }`}
            >
              {isClockedIn ? (
                <>
                  <Square className="w-4 h-4 fill-current" />
                  <span>Clock Out for Day</span>
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 fill-current" />
                  <span>Clock In & Start Shift</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Aggregate Stats (2 cols) */}
        <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white p-5 rounded-xl border border-neutral-200/80 shadow-xs flex flex-col justify-between">
            <div>
              <span className="text-xs text-neutral-400 font-semibold uppercase tracking-wider block">
                Total Hours Logged
              </span>
              <div className="flex items-baseline gap-1 mt-2">
                <span className="text-3xl font-bold font-mono tabular-nums text-neutral-900">
                  {totalHoursLogged.toFixed(1)}
                </span>
                <span className="text-xs text-neutral-500 font-medium">hrs</span>
              </div>
            </div>
            <p className="text-xs text-neutral-400 pt-3 border-t border-neutral-100 mt-4">
              Regular shift accumulation
            </p>
          </div>

          <div className="bg-white p-5 rounded-xl border border-neutral-200/80 shadow-xs flex flex-col justify-between">
            <div>
              <span className="text-xs text-neutral-400 font-semibold uppercase tracking-wider block">
                Overtime Accumulation
              </span>
              <div className="flex items-baseline gap-1 mt-2">
                <span className="text-3xl font-bold font-mono tabular-nums text-neutral-900">
                  {totalOvertime.toFixed(1)}
                </span>
                <span className="text-xs text-neutral-500 font-medium">hrs</span>
              </div>
            </div>
            <p className="text-xs text-neutral-400 pt-3 border-t border-neutral-100 mt-4">
              Qualifies for 1.5x pay rate
            </p>
          </div>

          <div className="bg-white p-5 rounded-xl border border-neutral-200/80 shadow-xs flex flex-col justify-between">
            <div>
              <span className="text-xs text-neutral-400 font-semibold uppercase tracking-wider block">
                Punctuality Rate
              </span>
              <div className="flex items-baseline gap-1 mt-2">
                <span className="text-3xl font-bold font-mono tabular-nums text-neutral-900">
                  {onTimePercentage}%
                </span>
                <span className="text-xs text-neutral-500 font-medium">on-schedule</span>
              </div>
            </div>
            <p className="text-xs text-neutral-400 pt-3 border-t border-neutral-100 mt-4">
              Based on shift schedules
            </p>
          </div>
        </div>
      </div>

      {/* Control Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 rounded-xl border border-neutral-200/80 shadow-xs">
        <div className="flex items-center gap-3">
          <select
            value={filterDept}
            onChange={(e) => setFilterDept(e.target.value)}
            className="px-3 py-1.5 text-xs bg-neutral-50 border border-neutral-200 rounded-lg text-neutral-700 cursor-pointer"
          >
            <option value="all">All Departments</option>
            <option value="Engineering">Engineering</option>
            <option value="Product & Design">Product & Design</option>
            <option value="People & HR">People & HR</option>
            <option value="Marketing">Marketing</option>
            <option value="Sales">Sales</option>
            <option value="Finance & Operations">Finance & Ops</option>
          </select>

          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-3 py-1.5 text-xs bg-neutral-50 border border-neutral-200 rounded-lg text-neutral-700 cursor-pointer"
          >
            <option value="all">All Statuses</option>
            <option value="present">Present (On Time)</option>
            <option value="late">Late Arrival</option>
            <option value="on_leave">On Leave</option>
            <option value="absent">Unexcused Absent</option>
          </select>
        </div>

        <div className="flex items-center gap-2">
          {permissions.canViewAllTimesheets && (
            <button
              onClick={() => exportCSV('attendance')}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-neutral-700 bg-white border border-neutral-200 rounded-lg hover:bg-neutral-50 transition-colors cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export Timesheet CSV</span>
            </button>
          )}
          {permissions.canLogManualAttendance && (
            <button
              onClick={() => setIsManualModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-neutral-900 hover:bg-neutral-800 rounded-lg transition-colors cursor-pointer shadow-xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Manual Time Entry</span>
            </button>
          )}
        </div>
      </div>

      {/* Attendance Log Table */}
      <div className="bg-white rounded-xl border border-neutral-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-neutral-200 bg-neutral-50/75 text-neutral-500 uppercase tracking-wider font-semibold">
                <th className="py-3 px-4">Employee</th>
                <th className="py-3 px-4">Department</th>
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4">Clock In</th>
                <th className="py-3 px-4">Clock Out</th>
                <th className="py-3 px-4 text-right">Total Hours</th>
                <th className="py-3 px-4 text-right">Overtime</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Work Location</th>
                <th className="py-3 px-4">Notes</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {filteredRecords.map((rec) => {
                const emp = employees.find((e) => e.id === rec.employeeId);
                return (
                  <tr key={rec.id} className="hover:bg-neutral-50/70 transition-colors">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2.5">
                        <Avatar src={emp?.avatarUrl} name={rec.employeeName} size="sm" />
                        <span className="font-semibold text-neutral-900">{rec.employeeName}</span>
                      </div>
                    </td>

                    <td className="py-3 px-4 text-neutral-600">{rec.department}</td>

                    <td className="py-3 px-4 font-mono text-neutral-500">{rec.date}</td>

                    <td className="py-3 px-4 font-mono tabular-nums text-neutral-900 font-medium">
                      {rec.clockIn || '—'}
                    </td>

                    <td className="py-3 px-4 font-mono tabular-nums text-neutral-900 font-medium">
                      {rec.clockOut || (rec.clockIn ? 'Active Now' : '—')}
                    </td>

                    <td className="py-3 px-4 text-right font-mono tabular-nums font-bold text-neutral-900">
                      {rec.totalHours > 0 ? `${rec.totalHours.toFixed(1)} hrs` : '0.0 hrs'}
                    </td>

                    <td className="py-3 px-4 text-right font-mono tabular-nums text-neutral-500">
                      {rec.overtimeHours > 0 ? `+${rec.overtimeHours.toFixed(1)} hrs` : '0.0'}
                    </td>

                    <td className="py-3 px-4">
                      <span className="capitalize font-semibold text-xs">
                        {rec.status === 'present' && <span className="text-emerald-700">Present</span>}
                        {rec.status === 'late' && <span className="text-amber-700">Late Arrival</span>}
                        {rec.status === 'on_leave' && <span className="text-neutral-500">On Leave</span>}
                        {rec.status === 'absent' && <span className="text-rose-700">Absent</span>}
                        {rec.status === 'half_day' && <span className="text-purple-700">Half Day</span>}
                      </span>
                    </td>

                    <td className="py-3 px-4 capitalize text-neutral-600">{rec.location}</td>

                    <td className="py-3 px-4 text-neutral-400 text-xs italic truncate max-w-xs">
                      {rec.notes || '—'}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Manual Time Entry Modal */}
      {isManualModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-xl shadow-2xl border border-neutral-200 w-full max-w-lg overflow-hidden flex flex-col">
            <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-200 bg-neutral-50/50">
              <h3 className="text-base font-bold text-neutral-900">Log Manual Time Record</h3>
              <button
                onClick={() => setIsManualModalOpen(false)}
                className="p-1.5 text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 rounded-lg cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleManualSubmit} className="p-6 space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-neutral-700 mb-1">Employee</label>
                <select
                  value={manualEmpId}
                  onChange={(e) => setManualEmpId(e.target.value)}
                  className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-lg"
                >
                  {employees.map((e) => (
                    <option key={e.id} value={e.id}>
                      {e.name} — {e.department}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-neutral-700 mb-1">Date</label>
                  <input
                    type="date"
                    value={manualDate}
                    onChange={(e) => setManualDate(e.target.value)}
                    className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-lg font-mono"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-neutral-700 mb-1">Attendance Status</label>
                  <select
                    value={manualStatus}
                    onChange={(e) => setManualStatus(e.target.value as AttendanceStatus)}
                    className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-lg"
                  >
                    <option value="present">Present (On-Time)</option>
                    <option value="late">Late Arrival</option>
                    <option value="half_day">Half Day</option>
                    <option value="absent">Excused Absence</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-semibold text-neutral-700 mb-1">Clock In</label>
                  <input
                    type="text"
                    placeholder="08:45 AM"
                    value={manualClockIn}
                    onChange={(e) => setManualClockIn(e.target.value)}
                    className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-lg font-mono"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-neutral-700 mb-1">Clock Out</label>
                  <input
                    type="text"
                    placeholder="05:15 PM"
                    value={manualClockOut}
                    onChange={(e) => setManualClockOut(e.target.value)}
                    className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-lg font-mono"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-neutral-700 mb-1">Total Hours</label>
                  <input
                    type="number"
                    step="0.5"
                    value={manualHours}
                    onChange={(e) => setManualHours(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-lg font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-neutral-700 mb-1">Audit Notes / Explanation</label>
                <textarea
                  rows={2}
                  placeholder="Forgotten badge, offsite client meeting, timezone travel..."
                  value={manualNotes}
                  onChange={(e) => setManualNotes(e.target.value)}
                  className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-lg"
                />
              </div>

              <div className="pt-3 flex justify-end gap-2 border-t border-neutral-200">
                <button
                  type="button"
                  onClick={() => setIsManualModalOpen(false)}
                  className="px-3.5 py-2 text-neutral-600 bg-neutral-100 hover:bg-neutral-200 rounded-lg font-medium cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-white bg-neutral-900 hover:bg-neutral-800 rounded-lg font-semibold cursor-pointer shadow-xs"
                >
                  Record Shift
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
