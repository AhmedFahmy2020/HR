import React, { useState, useRef, useEffect } from 'react';
import { useHR } from '../../context/HRContext';
import { UserRole } from '../../types/hr';
import { Avatar } from './Avatar';
import { PrivilegeMatrixModal } from './PrivilegeMatrixModal';
import { ShieldCheck, ChevronDown, Check, Grid } from 'lucide-react';

export const RoleSwitcher: React.FC = () => {
  const { activeUser, currentRole, switchRole, employees, signedInUser } = useHR();
  // Only a system administrator may preview the app as another role.
  const canViewAs = signedInUser?.privilegeRole === 'admin';
  const [isOpen, setIsOpen] = useState(false);
  const [isMatrixOpen, setIsMatrixOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const rolesMeta: Record<
    UserRole,
    { label: string; badge: string; color: string; desc: string; defaultName: string }
  > = {
    admin: {
      label: 'Admin',
      badge: 'System Administrator',
      color: 'bg-rose-50 text-rose-800 border-rose-200',
      desc: 'User logins, role assignment, password resets and full module access',
      defaultName: 'Omar Haddad',
    },
    employee: {
      label: 'Employee',
      badge: 'Individual Contributor',
      color: 'bg-neutral-100 text-neutral-700 border-neutral-300',
      desc: 'Self-service: personal time off, punch clock, own paystub, read-only directory',
      defaultName: 'Julian Chen',
    },
    leader: {
      label: 'Leader',
      badge: 'Team Lead / Manager',
      color: 'bg-sky-50 text-sky-800 border-sky-200',
      desc: 'Manage team approvals, candidate reviews, KPI progress, team timesheets',
      defaultName: 'Elena Rostova',
    },
    hr: {
      label: 'HR Team',
      badge: 'People Operations',
      color: 'bg-emerald-50 text-emerald-800 border-emerald-200',
      desc: 'Full personnel management, payroll batch runs, global leave approvals, ATS',
      defaultName: 'Sarah Jenkins',
    },
    cto: {
      label: 'CTO',
      badge: 'Chief Technology Officer',
      color: 'bg-indigo-50 text-indigo-800 border-indigo-200',
      desc: 'Technical organization oversight, engineering recruitment, architecture reviews',
      defaultName: 'Marcus Vance',
    },
    ceo: {
      label: 'CEO',
      badge: 'Chief Executive Officer',
      color: 'bg-purple-50 text-purple-800 border-purple-200',
      desc: 'Full executive authority, company-wide payroll commitments & global approvals',
      defaultName: 'David Sterling',
    },
  };

  if (!canViewAs) {
    return (
      <>
        <button
          onClick={() => setIsMatrixOpen(true)}
          className="flex items-center gap-2 px-3 py-1.5 bg-neutral-100 hover:bg-neutral-200/70 border border-neutral-200/90 rounded-lg text-xs font-semibold text-neutral-800 transition-colors cursor-pointer shadow-2xs"
          title="Your role is assigned by a system administrator. Click to see what it allows."
        >
          <ShieldCheck className="w-3.5 h-3.5 text-neutral-600" />
          <span className="hidden sm:inline text-neutral-500 font-normal">Role:</span>
          <span className="font-bold text-neutral-900">{rolesMeta[currentRole]?.label}</span>
          <Grid className="w-3.5 h-3.5 text-neutral-400" />
        </button>
        <PrivilegeMatrixModal isOpen={isMatrixOpen} onClose={() => setIsMatrixOpen(false)} />
      </>
    );
  }

  return (
    <>
      <div className="relative inline-block text-left" ref={dropdownRef}>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-2 px-3 py-1.5 bg-neutral-100 hover:bg-neutral-200/70 border border-neutral-200/90 rounded-lg text-xs font-semibold text-neutral-800 transition-colors cursor-pointer shadow-2xs"
          title="Preview the app as another role"
        >
          <ShieldCheck className="w-3.5 h-3.5 text-neutral-600" />
          <span className="hidden sm:inline text-neutral-500 font-normal">Role:</span>
          <span className="font-bold text-neutral-900">{rolesMeta[currentRole]?.label}</span>
          <ChevronDown className={`w-3.5 h-3.5 text-neutral-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        </button>

        {isOpen && (
          <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-xl border border-neutral-200 py-2 z-50 animate-in fade-in zoom-in-95 duration-100">
            <div className="px-3.5 py-2 border-b border-neutral-100 flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-neutral-900 block">View As Role</span>
                <span className="text-2xs text-neutral-500 block mt-0.5">
                  Admin preview of what each role sees
                </span>
              </div>
              <button
                onClick={() => {
                  setIsOpen(false);
                  setIsMatrixOpen(true);
                }}
                className="text-2xs font-semibold text-neutral-700 hover:text-neutral-950 bg-neutral-100 hover:bg-neutral-200 px-2 py-1 rounded flex items-center gap-1 transition-colors cursor-pointer"
              >
                <Grid className="w-3 h-3 text-neutral-500" />
                <span>Matrix</span>
              </button>
            </div>

            <div className="p-1 space-y-1">
              {(['admin', 'employee', 'hr', 'leader', 'cto', 'ceo'] as UserRole[]).map((role) => {
                const meta = rolesMeta[role];
                const isCurrent = currentRole === role;
                const repEmp =
                  signedInUser?.privilegeRole === role ? signedInUser : employees.find((e) => e.privilegeRole === role);

                return (
                  <button
                    key={role}
                    onClick={() => {
                      switchRole(role);
                      setIsOpen(false);
                    }}
                    className={`w-full text-left p-2 rounded-lg transition-colors cursor-pointer flex items-start justify-between gap-2 text-xs ${
                      isCurrent ? 'bg-neutral-100 font-semibold' : 'hover:bg-neutral-50'
                    }`}
                  >
                    <div className="flex items-start gap-2.5">
                      {repEmp && <Avatar src={repEmp.avatarUrl} name={repEmp.name} size="sm" />}
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="font-bold text-neutral-900">{meta.label}</span>
                          <span className="text-2xs text-neutral-500">({repEmp?.name || meta.defaultName})</span>
                        </div>
                        <p className="text-neutral-500 text-2xs mt-0.5 leading-snug">{meta.desc}</p>
                      </div>
                    </div>

                    {isCurrent && <Check className="w-4 h-4 text-neutral-900 shrink-0 mt-1" />}
                  </button>
                );
              })}
            </div>

            <div className="px-3.5 pt-2 pb-1 border-t border-neutral-100 flex items-center justify-between text-2xs text-neutral-400">
              <span className="truncate">
                Active: <span className="font-semibold text-neutral-800">{activeUser.name}</span>
              </span>
              <button
                onClick={() => {
                  setIsOpen(false);
                  setIsMatrixOpen(true);
                }}
                className="text-neutral-800 hover:underline font-semibold cursor-pointer shrink-0 ml-2"
              >
                View Permissions Matrix →
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Privilege Matrix Modal */}
      <PrivilegeMatrixModal isOpen={isMatrixOpen} onClose={() => setIsMatrixOpen(false)} />
    </>
  );
};
