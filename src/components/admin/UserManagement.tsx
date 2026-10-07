import React, { useMemo, useState } from 'react';
import { useHR } from '../../context/HRContext';
import { Department, UserRole } from '../../types/hr';
import { Avatar } from '../common/Avatar';
import { ROLE_META, ROLE_ORDER } from '../../utils/roles';
import { MIN_PASSWORD_LENGTH } from '../../utils/password';
import {
  UserPlus,
  KeyRound,
  ShieldCheck,
  Ban,
  CheckCircle2,
  Trash2,
  X,
  AlertCircle,
  Search,
  Eye,
  EyeOff,
} from 'lucide-react';

const DEPARTMENTS: Department[] = [
  'Engineering',
  'Product & Design',
  'People & HR',
  'Marketing',
  'Sales',
  'Finance & Operations',
];

const inputClass =
  'w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-neutral-900 focus:bg-white transition-colors';

const formatDateTime = (iso?: string) => {
  if (!iso) return 'Never';
  const d = new Date(iso);
  return isNaN(d.getTime()) ? iso : d.toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' });
};

const ErrorNote: React.FC<{ message: string | null }> = ({ message }) =>
  message ? (
    <div className="flex items-start gap-2 text-xs text-rose-700 bg-rose-50 border border-rose-200 rounded-lg px-3 py-2">
      <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
      <span>{message}</span>
    </div>
  ) : null;

const PasswordField: React.FC<{
  label: string;
  value: string;
  onChange: (v: string) => void;
}> = ({ label, value, onChange }) => {
  const [show, setShow] = useState(false);
  return (
    <div>
      <label className="block font-semibold text-neutral-700 mb-1">{label}</label>
      <div className="relative">
        <input
          type={show ? 'text' : 'password'}
          autoComplete="new-password"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={`At least ${MIN_PASSWORD_LENGTH} characters`}
          className={`${inputClass} pr-10`}
        />
        <button
          type="button"
          onClick={() => setShow((s) => !s)}
          className="absolute right-2.5 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-700 cursor-pointer"
          aria-label={show ? 'Hide password' : 'Show password'}
        >
          {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
        </button>
      </div>
    </div>
  );
};

const RoleSelect: React.FC<{ value: UserRole; onChange: (r: UserRole) => void }> = ({ value, onChange }) => (
  <div>
    <label className="block font-semibold text-neutral-700 mb-1">Role & privileges *</label>
    <select value={value} onChange={(e) => onChange(e.target.value as UserRole)} className={`${inputClass} cursor-pointer`}>
      {ROLE_ORDER.map((r) => (
        <option key={r} value={r}>
          {ROLE_META[r].label}
        </option>
      ))}
    </select>
    <p className="text-2xs text-neutral-500 mt-1">{ROLE_META[value].desc}</p>
  </div>
);

// ---------------------------------------------------------------------------
// Create user modal: either a brand-new person or an existing employee profile
// ---------------------------------------------------------------------------
const CreateUserModal: React.FC<{ onClose: () => void; onCreated: (msg: string) => void }> = ({ onClose, onCreated }) => {
  const { employees, accounts, createUser, grantAccess } = useHR();
  const withoutLogin = employees.filter((e) => !accounts.some((a) => a.employeeId === e.id));

  const [mode, setMode] = useState<'new' | 'existing'>(withoutLogin.length ? 'existing' : 'new');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [jobTitle, setJobTitle] = useState('');
  const [department, setDepartment] = useState<Department>('Engineering');
  const [employeeId, setEmployeeId] = useState(withoutLogin[0]?.id || '');
  const [role, setRole] = useState<UserRole>(withoutLogin[0]?.privilegeRole || 'employee');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirm) {
      setError('Passwords do not match.');
      return;
    }
    const result =
      mode === 'new'
        ? createUser({ name, email, jobTitle, department, password, role })
        : grantAccess(employeeId, password, role);
    if (!result.ok) {
      setError(result.error || 'Could not create the user.');
      return;
    }
    const who = mode === 'new' ? name.trim() : employees.find((x) => x.id === employeeId)?.name;
    onCreated(`${who} can now sign in as ${ROLE_META[role].label}.`);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-xl shadow-2xl border border-neutral-200 w-full max-w-lg overflow-hidden max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-200 bg-neutral-50/50">
          <div>
            <h3 className="text-base font-bold text-neutral-900 tracking-tight">Create User Login</h3>
            <p className="text-xs text-neutral-500 mt-0.5">The user signs in with this email and password and sees only what their role allows</p>
          </div>
          <button onClick={onClose} className="p-1.5 text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 rounded-lg transition-colors cursor-pointer">
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4 text-xs">
          <div className="grid grid-cols-2 gap-1 p-1 bg-neutral-100 rounded-lg">
            {(['existing', 'new'] as const).map((m) => (
              <button
                key={m}
                type="button"
                disabled={m === 'existing' && withoutLogin.length === 0}
                onClick={() => {
                  setMode(m);
                  setError(null);
                }}
                className={`py-1.5 rounded-md font-semibold transition-colors cursor-pointer disabled:cursor-not-allowed disabled:opacity-40 ${
                  mode === m ? 'bg-white text-neutral-900 shadow-xs' : 'text-neutral-500 hover:text-neutral-800'
                }`}
              >
                {m === 'existing' ? `Existing employee (${withoutLogin.length})` : 'New person'}
              </button>
            ))}
          </div>

          {mode === 'existing' ? (
            <div>
              <label className="block font-semibold text-neutral-700 mb-1">Employee without a login *</label>
              <select
                value={employeeId}
                onChange={(e) => {
                  setEmployeeId(e.target.value);
                  const emp = employees.find((x) => x.id === e.target.value);
                  if (emp) setRole(emp.privilegeRole || 'employee');
                }}
                className={`${inputClass} cursor-pointer`}
              >
                {withoutLogin.map((emp) => (
                  <option key={emp.id} value={emp.id}>
                    {emp.name} · {emp.email}
                  </option>
                ))}
              </select>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-neutral-700 mb-1">Full name *</label>
                  <input value={name} onChange={(e) => setName(e.target.value)} className={inputClass} placeholder="e.g. Nour Saleh" />
                </div>
                <div>
                  <label className="block font-semibold text-neutral-700 mb-1">Work email (login) *</label>
                  <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className={inputClass} placeholder="name@isoft.internal" />
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-neutral-700 mb-1">Job title *</label>
                  <input value={jobTitle} onChange={(e) => setJobTitle(e.target.value)} className={inputClass} placeholder="e.g. Payroll Specialist" />
                </div>
                <div>
                  <label className="block font-semibold text-neutral-700 mb-1">Department *</label>
                  <select value={department} onChange={(e) => setDepartment(e.target.value as Department)} className={`${inputClass} cursor-pointer`}>
                    {DEPARTMENTS.map((d) => (
                      <option key={d} value={d}>
                        {d}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </>
          )}

          <RoleSelect value={role} onChange={setRole} />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <PasswordField label="Password *" value={password} onChange={setPassword} />
            <PasswordField label="Confirm password *" value={confirm} onChange={setConfirm} />
          </div>

          <ErrorNote message={error} />

          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={onClose} className="px-3 py-2 font-semibold text-neutral-700 bg-white hover:bg-neutral-100 border border-neutral-200 rounded-lg cursor-pointer">
              Cancel
            </button>
            <button type="submit" className="inline-flex items-center gap-1.5 px-3 py-2 font-semibold text-white bg-neutral-900 hover:bg-neutral-800 rounded-lg cursor-pointer">
              <UserPlus className="w-3.5 h-3.5" />
              Create login
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// ---------------------------------------------------------------------------
// Reset password modal
// ---------------------------------------------------------------------------
const ResetPasswordModal: React.FC<{ employeeId: string; onClose: () => void; onDone: (msg: string) => void }> = ({
  employeeId,
  onClose,
  onDone,
}) => {
  const { employees, resetUserPassword } = useHR();
  const emp = employees.find((e) => e.id === employeeId);
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirm) {
      setError('Passwords do not match.');
      return;
    }
    const result = resetUserPassword(employeeId, password);
    if (!result.ok) {
      setError(result.error || 'Could not reset the password.');
      return;
    }
    onDone(`Password reset for ${emp?.name}.`);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-900/60 backdrop-blur-xs">
      <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-2xl border border-neutral-200 w-full max-w-sm p-6 space-y-4 text-xs">
        <div>
          <h3 className="text-base font-bold text-neutral-900 tracking-tight">Reset password</h3>
          <p className="text-xs text-neutral-500 mt-0.5">Set a new password for {emp?.name} and share it with them securely.</p>
        </div>
        <PasswordField label="New password" value={password} onChange={setPassword} />
        <PasswordField label="Confirm new password" value={confirm} onChange={setConfirm} />
        <ErrorNote message={error} />
        <div className="flex justify-end gap-2">
          <button type="button" onClick={onClose} className="px-3 py-2 font-semibold text-neutral-700 bg-white hover:bg-neutral-100 border border-neutral-200 rounded-lg cursor-pointer">
            Cancel
          </button>
          <button type="submit" className="px-3 py-2 font-semibold text-white bg-neutral-900 hover:bg-neutral-800 rounded-lg cursor-pointer">
            Save password
          </button>
        </div>
      </form>
    </div>
  );
};

// ---------------------------------------------------------------------------
// Main screen
// ---------------------------------------------------------------------------
export const UserManagement: React.FC = () => {
  const { employees, accounts, signedInUser, setUserRole, setAccountStatus, revokeAccess } = useHR();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [resetFor, setResetFor] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<UserRole | 'all'>('all');
  const [notice, setNotice] = useState<{ kind: 'ok' | 'error'; text: string } | null>(null);

  const rows = useMemo(
    () =>
      accounts
        .map((account) => ({ account, emp: employees.find((e) => e.id === account.employeeId) }))
        .filter((r): r is { account: typeof r.account; emp: NonNullable<typeof r.emp> } => Boolean(r.emp))
        .filter(({ emp }) => roleFilter === 'all' || emp.privilegeRole === roleFilter)
        .filter(({ emp }) => {
          const q = search.trim().toLowerCase();
          return !q || emp.name.toLowerCase().includes(q) || emp.email.toLowerCase().includes(q);
        })
        .sort((a, b) => ROLE_ORDER.indexOf(a.emp.privilegeRole) - ROLE_ORDER.indexOf(b.emp.privilegeRole) || a.emp.name.localeCompare(b.emp.name)),
    [accounts, employees, roleFilter, search]
  );

  const activeCount = accounts.filter((a) => a.status === 'active').length;
  const withoutLogin = employees.filter((e) => !accounts.some((a) => a.employeeId === e.id)).length;

  const report = (result: { ok: boolean; error?: string }, okText: string) =>
    setNotice(result.ok ? { kind: 'ok', text: okText } : { kind: 'error', text: result.error || 'Action failed.' });

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Heading */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-neutral-900">User Access</h2>
          <p className="text-sm text-neutral-500 mt-1">Create logins and decide what each person can see and do after they sign in.</p>
        </div>
        <button
          onClick={() => setIsCreateOpen(true)}
          className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-white bg-neutral-900 hover:bg-neutral-800 rounded-lg shadow-xs cursor-pointer"
        >
          <UserPlus className="w-4 h-4" />
          Create user
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { label: 'User logins', value: accounts.length },
          { label: 'Active', value: activeCount },
          { label: 'Disabled', value: accounts.length - activeCount },
          { label: 'Employees without login', value: withoutLogin },
        ].map((s) => (
          <div key={s.label} className="bg-white border border-neutral-200 rounded-xl p-4">
            <p className="text-xs text-neutral-500">{s.label}</p>
            <p className="text-2xl font-bold tabular-nums text-neutral-900 mt-1">{s.value}</p>
          </div>
        ))}
      </div>

      {notice && (
        <div
          className={`flex items-center justify-between gap-2 text-xs rounded-lg px-3 py-2 border ${
            notice.kind === 'ok' ? 'bg-emerald-50 border-emerald-200 text-emerald-800' : 'bg-rose-50 border-rose-200 text-rose-700'
          }`}
        >
          <span>{notice.text}</span>
          <button onClick={() => setNotice(null)} className="cursor-pointer" aria-label="Dismiss">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-2">
        <div className="relative flex-1">
          <Search className="w-3.5 h-3.5 text-neutral-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name or email"
            className="w-full pl-8 pr-3 py-2 text-xs bg-white border border-neutral-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-neutral-900"
          />
        </div>
        <select
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value as UserRole | 'all')}
          className="px-3 py-2 text-xs bg-white border border-neutral-200 rounded-lg cursor-pointer"
        >
          <option value="all">All roles</option>
          {ROLE_ORDER.map((r) => (
            <option key={r} value={r}>
              {ROLE_META[r].label}
            </option>
          ))}
        </select>
      </div>

      {/* Users table */}
      <div className="bg-white border border-neutral-200 rounded-xl overflow-x-auto">
        <table className="w-full text-xs text-left">
          <thead className="bg-neutral-50 text-neutral-500 uppercase tracking-wider text-2xs">
            <tr>
              <th className="px-4 py-3 font-semibold">User</th>
              <th className="px-4 py-3 font-semibold">Role</th>
              <th className="px-4 py-3 font-semibold">Status</th>
              <th className="px-4 py-3 font-semibold">Last sign-in</th>
              <th className="px-4 py-3 font-semibold">Created</th>
              <th className="px-4 py-3 font-semibold text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-100">
            {rows.map(({ account, emp }) => {
              const isSelf = emp.id === signedInUser?.id;
              const isActive = account.status === 'active';
              return (
                <tr key={emp.id} className={isActive ? '' : 'bg-neutral-50/70 text-neutral-400'}>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <Avatar src={emp.avatarUrl} name={emp.name} size="sm" />
                      <div className="min-w-0">
                        <p className="font-semibold text-neutral-900 truncate">
                          {emp.name} {isSelf && <span className="text-2xs font-normal text-neutral-400">(you)</span>}
                        </p>
                        <p className="text-neutral-500 truncate">{emp.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <select
                      value={emp.privilegeRole}
                      onChange={(e) => {
                        const role = e.target.value as UserRole;
                        report(setUserRole(emp.id, role), `${emp.name} is now ${ROLE_META[role].label}.`);
                      }}
                      className={`px-2 py-1 rounded-md border font-semibold cursor-pointer ${ROLE_META[emp.privilegeRole]?.style || ''}`}
                      aria-label={`Role for ${emp.name}`}
                    >
                      {ROLE_ORDER.map((r) => (
                        <option key={r} value={r}>
                          {ROLE_META[r].label}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full font-semibold ${
                        isActive ? 'bg-emerald-50 text-emerald-700' : 'bg-neutral-200 text-neutral-600'
                      }`}
                    >
                      {isActive ? <CheckCircle2 className="w-3 h-3" /> : <Ban className="w-3 h-3" />}
                      {isActive ? 'Active' : 'Disabled'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-neutral-500">{formatDateTime(account.lastLoginAt)}</td>
                  <td className="px-4 py-3 text-neutral-500">
                    {account.createdAt}
                    <span className="block text-2xs text-neutral-400">by {account.createdBy}</span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={() => setResetFor(emp.id)}
                        title="Reset password"
                        aria-label={`Reset password for ${emp.name}`}
                        className="p-1.5 rounded-lg text-neutral-500 hover:text-neutral-900 hover:bg-neutral-100 cursor-pointer"
                      >
                        <KeyRound className="w-4 h-4" />
                      </button>
                      <button
                        disabled={isSelf}
                        onClick={() =>
                          report(
                            setAccountStatus(emp.id, isActive ? 'disabled' : 'active'),
                            `${emp.name}'s login is now ${isActive ? 'disabled' : 'active'}.`
                          )
                        }
                        title={isActive ? 'Disable login' : 'Enable login'}
                        aria-label={`${isActive ? 'Disable' : 'Enable'} login for ${emp.name}`}
                        className="p-1.5 rounded-lg text-neutral-500 hover:text-amber-700 hover:bg-amber-50 cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
                      >
                        {isActive ? <Ban className="w-4 h-4" /> : <CheckCircle2 className="w-4 h-4" />}
                      </button>
                      <button
                        disabled={isSelf}
                        onClick={() => {
                          if (confirm(`Remove ${emp.name}'s login? Their employee profile is kept.`)) {
                            report(revokeAccess(emp.id), `${emp.name}'s login was removed.`);
                          }
                        }}
                        title="Remove login"
                        aria-label={`Remove login for ${emp.name}`}
                        className="p-1.5 rounded-lg text-neutral-500 hover:text-rose-600 hover:bg-rose-50 cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
            {rows.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-10 text-center text-neutral-500">
                  No users match these filters.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="flex items-start gap-2 text-2xs text-neutral-500">
        <ShieldCheck className="w-3.5 h-3.5 shrink-0 text-neutral-400" />
        <span>Role changes apply immediately. Disabled or removed users are signed out and cannot sign in again until access is restored.</span>
      </div>

      {isCreateOpen && (
        <CreateUserModal onClose={() => setIsCreateOpen(false)} onCreated={(text) => setNotice({ kind: 'ok', text })} />
      )}
      {resetFor && (
        <ResetPasswordModal employeeId={resetFor} onClose={() => setResetFor(null)} onDone={(text) => setNotice({ kind: 'ok', text })} />
      )}
    </div>
  );
};
