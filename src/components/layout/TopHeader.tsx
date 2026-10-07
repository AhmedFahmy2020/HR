import React from 'react';
import { NavTab } from './Sidebar';
import { useHR } from '../../context/HRContext';
import { RoleSwitcher } from '../common/RoleSwitcher';
import { Clock, Plus, Play, Square, Search, Bell } from 'lucide-react';

interface TopHeaderProps {
  currentTab: NavTab;
  onOpenNewEmployee: () => void;
  onOpenNewLeave: () => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
}

export const TopHeader: React.FC<TopHeaderProps> = ({
  currentTab,
  onOpenNewEmployee,
  onOpenNewLeave,
  searchQuery,
  setSearchQuery,
}) => {
  const { isClockedIn, clockInTime, elapsedSeconds, toggleClock, leaveRequests, permissions, currentRole } = useHR();

  const formatElapsed = (sec: number) => {
    const hrs = Math.floor(sec / 3600);
    const mins = Math.floor((sec % 3600) / 60);
    const secs = sec % 60;
    return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const titles: Record<NavTab, { breadcrumb: string; title: string }> = {
    overview: { breadcrumb: 'HRMS / Operations', title: 'Workforce Overview' },
    employees: { breadcrumb: 'HRMS / People', title: 'Employee Directory' },
    leaves: { breadcrumb: 'HRMS / Time Off', title: 'Leave & Absences' },
    attendance: { breadcrumb: 'HRMS / Operations', title: 'Attendance & Punch Clock' },
    payroll: { breadcrumb: 'HRMS / Finance', title: permissions.canManagePayroll ? 'Payroll & Compensation' : 'My Paystubs & Earnings' },
    recruitment: { breadcrumb: 'HRMS / Talent', title: permissions.canManageRecruitment ? 'Applicant Pipeline & ATS' : 'Internal Career Opportunities' },
    performance: { breadcrumb: 'HRMS / People', title: permissions.canManagePerformance ? 'Reviews & Goals' : 'My Performance & Objectives' },
    company: { breadcrumb: 'HRMS / Organization', title: 'Company Hub & Org' },
    users: { breadcrumb: 'HRMS / Administration', title: 'User Access & Roles' },
  };

  return (
    <header className="h-16 bg-white border-b border-neutral-200/90 flex items-center justify-between px-6 lg:px-8 sticky top-0 z-30">
      {/* Zone 1: Breadcrumb and Title */}
      <div className="flex flex-col min-w-0">
        <span className="text-xs text-neutral-400 font-medium tracking-tight">
          {titles[currentTab]?.breadcrumb}
        </span>
        <h1 className="text-base font-bold text-neutral-900 tracking-tight leading-tight truncate">
          {titles[currentTab]?.title}
        </h1>
      </div>

      {/* Zone 2: Live Punch Widget & Global Search */}
      <div className="flex items-center gap-3">
        {/* Live Punch Clock Widget */}
        <div className="hidden lg:flex items-center gap-2.5 bg-neutral-100/70 border border-neutral-200/80 rounded-lg px-2.5 py-1 text-xs">
          <div className="flex items-center gap-1.5">
            <span
              className={`w-2 h-2 rounded-full ${
                isClockedIn ? 'bg-emerald-500 animate-pulse' : 'bg-neutral-400'
              }`}
            />
            <span className="text-neutral-600 font-medium">
              {isClockedIn ? 'Session:' : 'Clocked Out'}
            </span>
            <span className="font-mono tabular-nums font-semibold text-neutral-900">
              {isClockedIn ? formatElapsed(elapsedSeconds) : '--:--:--'}
            </span>
          </div>

          <button
            onClick={toggleClock}
            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-semibold transition-colors cursor-pointer ${
              isClockedIn
                ? 'bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200'
                : 'bg-emerald-600 text-white hover:bg-emerald-700'
            }`}
          >
            {isClockedIn ? (
              <>
                <Square className="w-2.5 h-2.5 fill-current" />
                <span>Stop</span>
              </>
            ) : (
              <>
                <Play className="w-2.5 h-2.5 fill-current" />
                <span>Clock In</span>
              </>
            )}
          </button>
        </div>

        {/* Global Filter / Search Input */}
        <div className="relative">
          <Search className="w-3.5 h-3.5 text-neutral-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search employees, roles..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-48 sm:w-56 pl-8 pr-2.5 py-1 text-xs bg-neutral-50 hover:bg-neutral-100/60 focus:bg-white border border-neutral-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-neutral-900 transition-colors"
          />
        </div>
      </div>

      {/* Zone 3: Role Switcher & Primary Action */}
      <div className="flex items-center gap-3">
        {/* Privilege Role Switcher Dropdown */}
        <RoleSwitcher />

        {currentTab === 'leaves' || !permissions.canManageEmployees ? (
          <button
            onClick={onOpenNewLeave}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-neutral-900 hover:bg-neutral-800 rounded-lg transition-colors shadow-xs cursor-pointer whitespace-nowrap"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Request Leave</span>
          </button>
        ) : (
          <button
            onClick={onOpenNewEmployee}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-neutral-900 hover:bg-neutral-800 rounded-lg transition-colors shadow-xs cursor-pointer whitespace-nowrap"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Employee</span>
          </button>
        )}
      </div>
    </header>
  );
};
