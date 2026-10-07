import React from 'react';
import {
  LayoutDashboard,
  Users,
  CalendarDays,
  Clock,
  CircleDollarSign,
  Briefcase,
  Target,
  Building2,
  RotateCcw,
  Sparkles,
  Download,
  LogOut,
  ShieldCheck
} from 'lucide-react';
import { Avatar } from '../common/Avatar';
import { useHR } from '../../context/HRContext';
import { ROLE_META } from '../../utils/roles';

export type NavTab = 
  | 'overview' 
  | 'employees' 
  | 'leaves' 
  | 'attendance' 
  | 'payroll' 
  | 'recruitment' 
  | 'performance' 
  | 'company'
  | 'users';

interface SidebarProps {
  currentTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ currentTab, onSelectTab }) => {
  const { activeUser, currentRole, permissions, leaveRequests, jobPostings, resetDemoData, exportCSV, logout } = useHR();

  const pendingLeavesCount = leaveRequests.filter((l) => l.status === 'pending').length;
  const openJobsCount = jobPostings.filter((j) => j.status === 'open').length;

  const navItems: Array<{
    id: NavTab;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    count?: number;
  }> = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'employees', label: 'People Directory', icon: Users },
    { id: 'leaves', label: 'Time Off & Leaves', icon: CalendarDays, count: permissions.canApproveLeaves ? pendingLeavesCount : undefined },
    { id: 'attendance', label: 'Attendance & Logs', icon: Clock },
    {
      id: 'payroll',
      label: permissions.canManagePayroll ? 'Payroll & Salaries' : 'My Paystubs & Comp',
      icon: CircleDollarSign,
    },
    {
      id: 'recruitment',
      label: permissions.canManageRecruitment ? 'Recruitment & ATS' : 'Internal Careers',
      icon: Briefcase,
      count: permissions.canManageRecruitment ? openJobsCount : undefined,
    },
    {
      id: 'performance',
      label: permissions.canManagePerformance ? 'Performance & KPIs' : 'My Performance',
      icon: Target,
    },
    { id: 'company', label: 'Company & Org', icon: Building2 },
    ...(permissions.canManageUsers ? [{ id: 'users' as NavTab, label: 'User Access', icon: ShieldCheck }] : []),
  ];

  return (
    <aside className="w-64 bg-white border-r border-neutral-200/90 flex flex-col shrink-0 select-none h-screen sticky top-0">
      {/* Brand Header */}
      <div className="h-16 flex items-center justify-between px-6 border-b border-neutral-100">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-neutral-900 text-white flex items-center justify-center font-bold text-sm tracking-tight shadow-xs">
            I
          </div>
          <div>
            <span className="text-base font-bold tracking-tight text-neutral-900 block leading-tight">
              ISOFT HR
            </span>
            <span className="text-xs text-neutral-400 font-medium">People Platform</span>
          </div>
        </div>
      </div>

      {/* Navigation Links */}
      <div className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
        <div className="px-3 pb-2 text-xs font-semibold text-neutral-400 tracking-wider uppercase">
          Workspace
        </div>

        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentTab === item.id;

          return (
            <button
              key={item.id}
              onClick={() => onSelectTab(item.id)}
              className={`w-full flex items-center justify-between px-3 py-2 text-xs font-medium rounded-lg transition-colors cursor-pointer group text-left ${
                isActive
                  ? 'bg-neutral-900 text-white font-semibold'
                  : 'text-neutral-600 hover:text-neutral-950 hover:bg-neutral-100/70'
              }`}
            >
              <div className="flex items-center gap-2.5 truncate">
                <Icon
                  className={`w-4 h-4 shrink-0 transition-colors ${
                    isActive ? 'text-white' : 'text-neutral-400 group-hover:text-neutral-700'
                  }`}
                />
                <span className="truncate">{item.label}</span>
              </div>

              {item.count !== undefined && item.count > 0 && (
                <span
                  className={`text-xs px-1.5 py-0.2 rounded-md font-mono tabular-nums ${
                    isActive
                      ? 'bg-neutral-800 text-neutral-200'
                      : 'bg-neutral-100 text-neutral-600 group-hover:bg-neutral-200'
                  }`}
                >
                  {item.count}
                </span>
              )}
            </button>
          );
        })}

        {/* Quick Tools Section */}
        <div className="pt-6 px-3 pb-2 text-xs font-semibold text-neutral-400 tracking-wider uppercase">
          Quick Utilities
        </div>
        {permissions.canViewAllSalaries && (
          <button
            onClick={() => exportCSV('employees')}
            className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-neutral-600 hover:text-neutral-950 hover:bg-neutral-100/70 rounded-lg transition-colors cursor-pointer"
          >
            <Download className="w-4 h-4 text-neutral-400 shrink-0" />
            <span className="truncate">Export Workforce CSV</span>
          </button>
        )}
        <button
          onClick={() => {
            if (confirm('Reset database to clean demo data state?')) {
              resetDemoData();
            }
          }}
          className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-neutral-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
        >
          <RotateCcw className="w-4 h-4 shrink-0" />
          <span className="truncate">Reset Mock State</span>
        </button>
      </div>

      {/* User Session Footer */}
      <div className="p-3 border-t border-neutral-100 bg-neutral-50/50">
        <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-white transition-colors border border-transparent hover:border-neutral-200/60">
          <Avatar src={activeUser.avatarUrl} name={activeUser.name} size="md" />
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5">
              <p className="text-xs font-semibold text-neutral-900 truncate">{activeUser.name}</p>
              <span className={`text-2xs px-1.5 py-0.5 rounded font-bold uppercase tracking-wider shrink-0 ${ROLE_META[currentRole]?.style || 'bg-neutral-100 text-neutral-700'}`}>
                {ROLE_META[currentRole]?.tag || currentRole}
              </span>
            </div>
            <p className="text-xs text-neutral-500 truncate mt-0.5">{activeUser.role}</p>
          </div>
          <button
            onClick={() => {
              if (confirm('Sign out of ISOFT HR?')) {
                logout();
              }
            }}
            title="Sign out"
            aria-label="Sign out"
            className="shrink-0 p-1.5 rounded-lg text-neutral-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  );
};
