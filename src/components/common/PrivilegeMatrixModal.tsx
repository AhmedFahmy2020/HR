import React from 'react';
import { useHR } from '../../context/HRContext';
import { UserRole } from '../../types/hr';
import { Avatar } from './Avatar';
import {
  ShieldCheck,
  Check,
  X as XIcon,
  Users,
  CalendarDays,
  Clock,
  CircleDollarSign,
  Briefcase,
  Target,
  Building2,
  Sparkles,
  ArrowRight
} from 'lucide-react';

interface PrivilegeMatrixModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface MatrixItem {
  category: string;
  icon: React.ComponentType<{ className?: string }>;
  features: Array<{
    name: string;
    description: string;
    // The admin column defaults to full access unless a feature says otherwise.
    roles: Record<Exclude<UserRole, 'admin'>, boolean | string> & { admin?: boolean | string };
  }>;
}

export const PrivilegeMatrixModal: React.FC<PrivilegeMatrixModalProps> = ({ isOpen, onClose }) => {
  const { currentRole, switchRole, employees, activeUser, signedInUser } = useHR();
  const canViewAs = signedInUser?.privilegeRole === 'admin';

  if (!isOpen) return null;

  const roleHeaders: Array<{
    id: UserRole;
    title: string;
    subtitle: string;
    badgeColor: string;
    description: string;
  }> = [
    {
      id: 'employee',
      title: 'Employee',
      subtitle: 'Individual Contributor',
      badgeColor: 'bg-neutral-100 text-neutral-800 border-neutral-300',
      description: 'Self-service workspace for personal time off, punch clock, paystub viewing, and internal openings.',
    },
    {
      id: 'leader',
      title: 'Leader',
      subtitle: 'Team Lead / Manager',
      badgeColor: 'bg-sky-50 text-sky-800 border-sky-200',
      description: 'Departmental authority: approve team leaves, conduct performance reviews, screen candidates.',
    },
    {
      id: 'hr',
      title: 'HR Team',
      subtitle: 'People & Operations',
      badgeColor: 'bg-emerald-50 text-emerald-800 border-emerald-200',
      description: 'Full personnel lifecycle: hiring ATS, salary management, company-wide leave approvals, payroll runs.',
    },
    {
      id: 'cto',
      title: 'CTO',
      subtitle: 'Chief Technology Officer',
      badgeColor: 'bg-indigo-50 text-indigo-800 border-indigo-200',
      description: 'Technical org authority: engineering hiring pipeline, technical approvals, tech compensation insights.',
    },
    {
      id: 'ceo',
      title: 'CEO',
      subtitle: 'Chief Executive Officer',
      badgeColor: 'bg-purple-50 text-purple-800 border-purple-200',
      description: 'Ultimate enterprise authority: company-wide payroll execution, strategic hiring, executive reviews.',
    },
    {
      id: 'admin',
      title: 'Admin',
      subtitle: 'System Administrator',
      badgeColor: 'bg-rose-50 text-rose-800 border-rose-200',
      description: 'Platform owner: creates user logins, assigns roles, resets passwords, full module access.',
    },
  ];

  const matrixData: MatrixItem[] = [
    {
      category: 'User Access & Security',
      icon: ShieldCheck,
      features: [
        {
          name: 'Create User Logins',
          description: 'Give a person an email and password to sign in',
          roles: { employee: false, leader: false, hr: false, cto: false, ceo: false },
        },
        {
          name: 'Assign Roles & Privileges',
          description: 'Decide which role each user signs in with',
          roles: { employee: false, leader: false, hr: false, cto: false, ceo: false },
        },
        {
          name: 'Reset Passwords & Disable Logins',
          description: 'Recover or suspend access to the platform',
          roles: { employee: false, leader: false, hr: false, cto: false, ceo: false },
        },
      ],
    },
    {
      category: 'Workforce & People Directory',
      icon: Users,
      features: [
        {
          name: 'Directory Lookup',
          description: 'Search colleagues, view email, phone, location & department',
          roles: { employee: true, leader: true, hr: true, cto: true, ceo: true },
        },
        {
          name: 'Confidential Salaries',
          description: 'View base compensation of other colleagues',
          roles: { employee: false, leader: false, hr: true, cto: true, ceo: true },
        },
        {
          name: 'Onboard New Employees',
          description: 'Add new team members with salary, role, and department',
          roles: { employee: false, leader: false, hr: true, cto: true, ceo: true },
        },
        {
          name: 'Edit Employee Records',
          description: 'Modify contact details, emergency contacts, compensation & notes',
          roles: { employee: false, leader: false, hr: true, cto: true, ceo: true },
        },
        {
          name: 'Offboard Staff',
          description: 'Remove or offboard personnel from active company roster',
          roles: { employee: false, leader: false, hr: true, cto: true, ceo: true },
        },
      ],
    },
    {
      category: 'Time Off & Leave Management',
      icon: CalendarDays,
      features: [
        {
          name: 'Submit Leave Requests',
          description: 'Apply for annual PTO, sick, or personal absence',
          roles: { employee: true, leader: true, hr: true, cto: true, ceo: true },
        },
        {
          name: 'View Personal Balances',
          description: 'Track own used and available vacation days',
          roles: { employee: true, leader: true, hr: true, cto: true, ceo: true },
        },
        {
          name: 'Approve Department Leaves',
          description: 'Review and approve/decline team time-off applications',
          roles: { employee: false, leader: true, hr: true, cto: true, ceo: true },
        },
        {
          name: 'Company-Wide Leave Approvals',
          description: 'Approve leave requests across all departments',
          roles: { employee: false, leader: false, hr: true, cto: 'Tech Org', ceo: true },
        },
      ],
    },
    {
      category: 'Attendance & Punch Clock',
      icon: Clock,
      features: [
        {
          name: 'Live Punch In / Out',
          description: 'Track daily attendance session with digital stopwatch',
          roles: { employee: true, leader: true, hr: true, cto: true, ceo: true },
        },
        {
          name: 'View Personal Timesheet',
          description: 'Historical punch records, daily hours & overtime logs',
          roles: { employee: true, leader: true, hr: true, cto: true, ceo: true },
        },
        {
          name: 'View Team Attendance',
          description: 'Monitor daily presence and remote status of colleagues',
          roles: { employee: false, leader: true, hr: true, cto: true, ceo: true },
        },
        {
          name: 'Manual Timesheet Adjustment',
          description: 'Log or correct attendance entries on behalf of staff',
          roles: { employee: false, leader: false, hr: true, cto: true, ceo: true },
        },
      ],
    },
    {
      category: 'Payroll & Compensation',
      icon: CircleDollarSign,
      features: [
        {
          name: 'View Personal Paystubs',
          description: 'Access itemized earnings slips, deductions & net pay',
          roles: { employee: true, leader: true, hr: true, cto: true, ceo: true },
        },
        {
          name: 'View All Employee Salaries',
          description: 'Access full company salary ledger',
          roles: { employee: false, leader: false, hr: true, cto: true, ceo: true },
        },
        {
          name: 'Run Monthly Payroll Batch',
          description: 'Trigger company-wide direct deposit ACH disbursement',
          roles: { employee: false, leader: false, hr: true, cto: false, ceo: true },
        },
        {
          name: 'Export Payroll Ledger CSV',
          description: 'Download reconciliation data for banking & taxes',
          roles: { employee: false, leader: false, hr: true, cto: false, ceo: true },
        },
      ],
    },
    {
      category: 'Talent Acquisition & ATS',
      icon: Briefcase,
      features: [
        {
          name: 'Internal Job Board',
          description: 'View active postings and refer candidates',
          roles: { employee: true, leader: true, hr: true, cto: true, ceo: true },
        },
        {
          name: 'Review Candidate Profiles',
          description: 'View applicant experience, resumes & assign ratings',
          roles: { employee: false, leader: true, hr: true, cto: true, ceo: true },
        },
        {
          name: 'Move Pipeline Stages',
          description: 'Advance applicants (Screening → Interview → Offer)',
          roles: { employee: false, leader: 'Dept', hr: true, cto: true, ceo: true },
        },
        {
          name: 'Post New Requisitions',
          description: 'Create and publish new job vacancies',
          roles: { employee: false, leader: false, hr: true, cto: true, ceo: true },
        },
      ],
    },
    {
      category: 'Performance & Reviews',
      icon: Target,
      features: [
        {
          name: 'View Own Scorecard',
          description: 'Personal quarterly review, rating & assigned KPIs',
          roles: { employee: true, leader: true, hr: true, cto: true, ceo: true },
        },
        {
          name: 'Conduct Team Evaluations',
          description: 'Provide review feedback and adjust KPI progress sliders',
          roles: { employee: false, leader: true, hr: true, cto: true, ceo: true },
        },
        {
          name: 'Create Review Cycles',
          description: 'Launch new quarterly appraisal cycles company-wide',
          roles: { employee: false, leader: false, hr: true, cto: true, ceo: true },
        },
      ],
    },
    {
      category: 'Company Hub & Notices',
      icon: Building2,
      features: [
        {
          name: 'Read Announcements',
          description: 'Browse town hall notices, memos & policy updates',
          roles: { employee: true, leader: true, hr: true, cto: true, ceo: true },
        },
        {
          name: 'Publish Announcements',
          description: 'Broadcast notices to departments or company',
          roles: { employee: false, leader: 'Team', hr: true, cto: true, ceo: true },
        },
        {
          name: 'Delete Notices',
          description: 'Remove outdated or archived bulletins',
          roles: { employee: false, leader: false, hr: true, cto: true, ceo: true },
        },
      ],
    },
  ];

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-neutral-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl border border-neutral-200 w-full max-w-6xl max-h-[92vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="p-6 border-b border-neutral-200 bg-neutral-50/70 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-neutral-900 text-white flex items-center justify-center shadow-xs">
              <ShieldCheck className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-neutral-900 tracking-tight">
                  ISOFT HR Privilege & Access Control Matrix
                </h2>
                <span className="text-xs px-2 py-0.5 rounded-full bg-neutral-200 text-neutral-700 font-semibold font-mono">
                  RBAC
                </span>
              </div>
              <p className="text-xs text-neutral-500 mt-0.5">
                Role-based privileges for Employee, Leader, HR Team, CTO, CEO and Admin
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="text-xs text-neutral-500 hidden sm:block text-right">
              <span>Active Privilege:</span>{' '}
              <span className="font-bold text-neutral-900 capitalize">{currentRole}</span>
              <span className="block text-2xs text-neutral-400">({activeUser.name})</span>
            </div>
            <button
              onClick={onClose}
              className="px-3 py-1.5 text-xs font-semibold text-neutral-700 bg-white hover:bg-neutral-100 border border-neutral-200 rounded-lg transition-colors cursor-pointer"
            >
              Close Matrix
            </button>
          </div>
        </div>

        {/* Matrix Table */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              {/* Role Column Headers with Switch Buttons */}
              <thead>
                <tr className="border-b-2 border-neutral-200 bg-white sticky top-0 z-10">
                  <th className="py-4 px-4 w-72 min-w-64 align-bottom bg-white">
                    <span className="text-xs font-bold text-neutral-400 uppercase tracking-wider block">
                      Feature & Permission
                    </span>
                    <span className="text-2xs text-neutral-400 font-normal">
                      {canViewAs ? 'Admins can preview any role' : 'Roles are assigned by a system administrator'}
                    </span>
                  </th>

                  {roleHeaders.map((role) => {
                    const isCurrent = currentRole === role.id;
                    const repEmp =
                      signedInUser?.privilegeRole === role.id ? signedInUser : employees.find((e) => e.privilegeRole === role.id);

                    return (
                      <th
                        key={role.id}
                        className={`py-4 px-3 w-40 min-w-36 text-center align-top transition-colors ${
                          isCurrent ? 'bg-neutral-50/90 border-x-2 border-neutral-900' : 'bg-white'
                        }`}
                      >
                        <div className="flex flex-col items-center">
                          {repEmp && (
                            <div className="mb-2 relative">
                              <Avatar src={repEmp.avatarUrl} name={repEmp.name} size="sm" />
                              {isCurrent && (
                                <span className="absolute -bottom-1 -right-1 w-3 h-3 bg-emerald-500 rounded-full border-2 border-white" />
                              )}
                            </div>
                          )}

                          <span className="font-bold text-neutral-900 text-xs">{role.title}</span>
                          <span className="text-2xs text-neutral-500 font-medium">{role.subtitle}</span>

                          {canViewAs && (
                          <button
                            onClick={() => switchRole(role.id)}
                            className={`mt-2.5 w-full py-1.5 px-2 rounded-lg text-xs font-semibold transition-all cursor-pointer shadow-2xs ${
                              isCurrent
                                ? 'bg-neutral-900 text-white font-bold cursor-default'
                                : 'bg-neutral-100 hover:bg-neutral-200/80 text-neutral-700 border border-neutral-200'
                            }`}
                          >
                            {isCurrent ? 'Active Role' : 'View As'}
                          </button>
                          )}
                        </div>
                      </th>
                    );
                  })}
                </tr>
              </thead>

              {/* Matrix Rows Grouped by Category */}
              <tbody className="divide-y divide-neutral-100">
                {matrixData.map((group, groupIdx) => {
                  const CategoryIcon = group.icon;
                  return (
                    <React.Fragment key={groupIdx}>
                      {/* Category Header Row */}
                      <tr className="bg-neutral-50/80">
                        <td colSpan={roleHeaders.length + 1} className="py-2.5 px-4 font-bold text-neutral-900 text-xs">
                          <div className="flex items-center gap-2">
                            <CategoryIcon className="w-3.5 h-3.5 text-neutral-600" />
                            <span>{group.category}</span>
                          </div>
                        </td>
                      </tr>

                      {/* Feature Rows */}
                      {group.features.map((feat, featIdx) => (
                        <tr key={featIdx} className="hover:bg-neutral-50/40 transition-colors">
                          {/* Feature Name & Description */}
                          <td className="py-3 px-4">
                            <p className="font-semibold text-neutral-900">{feat.name}</p>
                            <p className="text-2xs text-neutral-500 mt-0.5 leading-snug">
                              {feat.description}
                            </p>
                          </td>

                          {/* Role Indicators */}
                          {roleHeaders.map((role) => {
                            const isCurrent = currentRole === role.id;
                            const val = role.id === 'admin' ? feat.roles.admin ?? true : feat.roles[role.id];

                            return (
                              <td
                                key={role.id}
                                className={`py-3 px-3 text-center align-middle ${
                                  isCurrent ? 'bg-neutral-50/50 border-x-2 border-neutral-900/10' : ''
                                }`}
                              >
                                {val === true && (
                                  <div className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-emerald-100 text-emerald-700">
                                    <Check className="w-3 h-3 stroke-[2.5]" />
                                  </div>
                                )}
                                {val === false && (
                                  <div className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-neutral-100 text-neutral-400">
                                    <XIcon className="w-3 h-3" />
                                  </div>
                                )}
                                {typeof val === 'string' && (
                                  <span className="inline-block px-1.5 py-0.5 rounded text-2xs font-semibold bg-sky-100 text-sky-800">
                                    {val}
                                  </span>
                                )}
                              </td>
                            );
                          })}
                        </tr>
                      ))}
                    </React.Fragment>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Footer Summary */}
        <div className="p-4 border-t border-neutral-200 bg-neutral-50/90 flex flex-col sm:flex-row items-center justify-between text-xs text-neutral-600 gap-2">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span>
              Privileges are enforced live across all navigation routes, action buttons, modals, and data columns.
            </span>
          </div>
          <span className="font-mono text-neutral-500 text-2xs">
            ISOFT HR Security Standard · ISO-27001 Compliant Roles
          </span>
        </div>
      </div>
    </div>
  );
};
