import React, { useState } from 'react';
import { useHR } from '../../context/HRContext';
import { ROLE_META, ROLE_ORDER } from '../../utils/roles';
import { Avatar } from '../common/Avatar';
import { DEMO_PASSWORD } from '../../context/HRContext';
import { ShieldCheck, LogIn, AlertCircle, Eye, EyeOff, Building2 } from 'lucide-react';


export const LoginScreen: React.FC = () => {
  const { login, loginAs, employees, accounts } = useHR();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // One representative active login per privilege role for quick demo sign-in.
  const canSignIn = (empId: string) => accounts.some((a) => a.employeeId === empId && a.status === 'active');
  const personas = ROLE_ORDER
    .map((role) => employees.find((e) => e.privilegeRole === role && canSignIn(e.id)))
    .filter((e): e is NonNullable<typeof e> => Boolean(e));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const result = login(email, password);
    if (!result.ok) {
      setError(result.error || 'Unable to sign in.');
    }
  };

  const handlePersona = (empId: string, empEmail: string) => {
    setError(null);
    setEmail(empEmail);
    loginAs(empId);
  };

  return (
    <div className="min-h-screen w-full flex bg-neutral-50 text-neutral-900 font-sans">
      {/* Left: brand panel */}
      <div className="hidden lg:flex flex-col justify-between w-[42%] bg-neutral-900 text-white p-12 relative overflow-hidden">
        <div className="relative z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white text-neutral-900 flex items-center justify-center font-bold text-lg tracking-tight">
              I
            </div>
            <div>
              <span className="text-lg font-bold tracking-tight block leading-tight">ISOFT HR</span>
              <span className="text-xs text-neutral-400 font-medium">People & Operations Platform</span>
            </div>
          </div>
        </div>

        <div className="relative z-10 space-y-6">
          <h1 className="text-3xl font-bold tracking-tight leading-tight">
            Run your entire workforce from one secure console.
          </h1>
          <p className="text-neutral-300 text-sm leading-relaxed max-w-md">
            Directory, attendance, leave, payroll, recruitment and performance — governed by
            role-based access control so every teammate sees exactly what they should.
          </p>
          <div className="flex items-center gap-2 text-xs text-neutral-400">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>RBAC enforced · ISO-27001 compliant roles · Payroll in AED</span>
          </div>
        </div>

        <div className="relative z-10 text-2xs text-neutral-500">
          © {new Date().getFullYear()} ISOFT HR. All rights reserved.
        </div>

        {/* Decorative gradient blobs */}
        <div className="absolute -top-24 -right-24 w-72 h-72 rounded-full bg-emerald-500/10 blur-3xl" />
        <div className="absolute bottom-0 -left-20 w-72 h-72 rounded-full bg-indigo-500/10 blur-3xl" />
      </div>

      {/* Right: sign-in form */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-10">
        <div className="w-full max-w-sm">
          {/* Mobile brand */}
          <div className="lg:hidden flex items-center gap-2.5 mb-8">
            <div className="w-9 h-9 rounded-lg bg-neutral-900 text-white flex items-center justify-center font-bold text-sm">
              I
            </div>
            <span className="text-base font-bold tracking-tight">ISOFT HR</span>
          </div>

          <h2 className="text-xl font-bold tracking-tight text-neutral-900">Sign in to your workspace</h2>
          <p className="text-sm text-neutral-500 mt-1">Use your work email to continue.</p>

          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <div>
              <label htmlFor="email" className="block text-xs font-semibold text-neutral-700 mb-1">
                Work Email
              </label>
              <input
                id="email"
                type="email"
                autoComplete="username"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setError(null);
                }}
                placeholder="you@isoft.internal"
                className="w-full px-3 py-2 text-sm bg-neutral-50 border border-neutral-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-neutral-900 focus:bg-white transition-colors"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-xs font-semibold text-neutral-700 mb-1">
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setError(null);
                  }}
                  placeholder="••••••••"
                  className="w-full px-3 py-2 pr-10 text-sm bg-neutral-50 border border-neutral-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-neutral-900 focus:bg-white transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((s) => !s)}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-700 cursor-pointer"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {error && (
              <div className="flex items-start gap-2 text-xs text-rose-700 bg-rose-50 border border-rose-200 rounded-lg px-3 py-2">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            <button
              type="submit"
              className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-semibold text-white bg-neutral-900 hover:bg-neutral-800 rounded-lg transition-colors shadow-xs cursor-pointer"
            >
              <LogIn className="w-4 h-4" />
              <span>Sign In</span>
            </button>
          </form>

          <div className="mt-5 text-2xs text-neutral-500 bg-neutral-100/70 border border-neutral-200 rounded-lg px-3 py-2">
            <span className="font-semibold text-neutral-700">Demo password:</span>{' '}
            <span className="font-mono text-neutral-900">{DEMO_PASSWORD}</span>{' '}
            — works for the seeded accounts below. Users created by an admin sign in with the password the admin set.
          </div>

          {/* Quick persona sign-in */}
          <div className="mt-6">
            <div className="flex items-center gap-2 mb-3">
              <Building2 className="w-3.5 h-3.5 text-neutral-400" />
              <span className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">
                Quick sign-in as
              </span>
            </div>
            <div className="space-y-1.5">
              {personas.map((emp) => (
                <button
                  key={emp.id}
                  onClick={() => handlePersona(emp.id, emp.email)}
                  className="w-full flex items-center gap-3 p-2 rounded-lg border border-neutral-200 hover:border-neutral-300 hover:bg-neutral-50 transition-colors cursor-pointer text-left"
                >
                  <Avatar src={emp.avatarUrl} name={emp.name} size="sm" />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-semibold text-neutral-900 truncate">{emp.name}</span>
                      <span
                        className={`text-2xs px-1.5 py-0.5 rounded font-bold uppercase tracking-wider shrink-0 ${
                          ROLE_META[emp.privilegeRole]?.style || 'bg-neutral-100 text-neutral-700'
                        }`}
                      >
                        {ROLE_META[emp.privilegeRole]?.tag || emp.privilegeRole}
                      </span>
                    </div>
                    <p className="text-2xs text-neutral-500 truncate mt-0.5">{emp.role}</p>
                  </div>
                  <LogIn className="w-3.5 h-3.5 text-neutral-300 shrink-0" />
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
