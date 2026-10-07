import { UserRole } from '../types/hr';

// Display metadata for every privilege role, highest authority first.
export const ROLE_ORDER: UserRole[] = ['admin', 'ceo', 'cto', 'hr', 'leader', 'employee'];

export const ROLE_META: Record<UserRole, { label: string; tag: string; style: string; desc: string }> = {
  admin: {
    label: 'System Admin',
    tag: 'Admin',
    style: 'bg-rose-100 text-rose-800 border-rose-200',
    desc: 'Creates user logins, assigns roles, resets passwords, plus full access to every module',
  },
  ceo: {
    label: 'CEO',
    tag: 'CEO',
    style: 'bg-purple-100 text-purple-800 border-purple-200',
    desc: 'Full executive authority, company-wide payroll and global approvals',
  },
  cto: {
    label: 'CTO',
    tag: 'CTO',
    style: 'bg-indigo-100 text-indigo-800 border-indigo-200',
    desc: 'Technical org oversight, engineering hiring, approvals and salary insights',
  },
  hr: {
    label: 'HR Team',
    tag: 'HR Team',
    style: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    desc: 'Full personnel management, payroll runs, company-wide leave approvals, ATS',
  },
  leader: {
    label: 'Leader',
    tag: 'Team Lead',
    style: 'bg-sky-100 text-sky-800 border-sky-200',
    desc: 'Approves team leaves, reviews candidates and KPIs, sees team timesheets',
  },
  employee: {
    label: 'Employee',
    tag: 'Staff',
    style: 'bg-neutral-200 text-neutral-800 border-neutral-200',
    desc: 'Self-service: punch clock, own leaves, own paystubs and KPIs, directory',
  },
};
