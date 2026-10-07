import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  Employee,
  LeaveRequest,
  AttendanceRecord,
  PayrollRecord,
  JobPosting,
  JobApplicant,
  PerformanceReview,
  Announcement,
  LeaveType,
  ApplicantStage,
  UserRole,
  RolePermissions,
  UserAccount,
  AccountStatus
} from '../types/hr';
import {
  INITIAL_EMPLOYEES,
  INITIAL_LEAVE_REQUESTS,
  INITIAL_ATTENDANCE,
  INITIAL_PAYROLL,
  INITIAL_JOBS,
  INITIAL_APPLICANTS,
  INITIAL_REVIEWS,
  INITIAL_ANNOUNCEMENTS,
  SEED_ADMIN
} from '../data/initialData';
import { hashPassword, MIN_PASSWORD_LENGTH } from '../utils/password';

export const getPermissionsForRole = (role: UserRole): RolePermissions => {
  switch (role) {
    case 'admin':
      return {
        canManageEmployees: true,
        canViewAllSalaries: true,
        canApproveLeaves: true,
        canManagePayroll: true,
        canManageRecruitment: true,
        canManagePerformance: true,
        canPostAnnouncements: true,
        canDeleteAnnouncements: true,
        canViewAllTimesheets: true,
        canLogManualAttendance: true,
        canManageUsers: true,
      };
    case 'ceo':
      return {
        canManageEmployees: true,
        canViewAllSalaries: true,
        canApproveLeaves: true,
        canManagePayroll: true,
        canManageRecruitment: true,
        canManagePerformance: true,
        canPostAnnouncements: true,
        canDeleteAnnouncements: true,
        canViewAllTimesheets: true,
        canLogManualAttendance: true,
        canManageUsers: false,
      };
    case 'cto':
      return {
        canManageEmployees: true, // technical org architecture & engineering talent
        canViewAllSalaries: true, // executive technical salary insights
        canApproveLeaves: true, // technical approvals & team leads
        canManagePayroll: false, // CFO/HR & CEO execute payroll disbursement
        canManageRecruitment: true, // engineering hiring pipeline & offers
        canManagePerformance: true, // engineering reviews & KPI goals
        canPostAnnouncements: true, // tech architecture notices & memos
        canDeleteAnnouncements: true,
        canViewAllTimesheets: true,
        canLogManualAttendance: true,
        canManageUsers: false,
      };
    case 'hr':
      return {
        canManageEmployees: true, // full employee lifecycle
        canViewAllSalaries: true, // compensation planning
        canApproveLeaves: true, // all company leave approvals
        canManagePayroll: true, // run payroll batches & ledger
        canManageRecruitment: true, // talent acquisition & ATS
        canManagePerformance: true, // company review cycles
        canPostAnnouncements: true, // official company policies
        canDeleteAnnouncements: true,
        canViewAllTimesheets: true,
        canLogManualAttendance: true,
        canManageUsers: false,
      };
    case 'leader':
      return {
        canManageEmployees: false, // restricted from altering personnel or executive records
        canViewAllSalaries: false, // salaries of peers and other teams are confidential
        canApproveLeaves: true, // approve/decline team time off
        canManagePayroll: false, // restricted from executing company payroll
        canManageRecruitment: true, // evaluate candidates & move interview stages
        canManagePerformance: true, // conduct reviews & adjust KPI sliders for direct reports
        canPostAnnouncements: true, // team memos & notices
        canDeleteAnnouncements: false,
        canViewAllTimesheets: true, // team attendance logs
        canLogManualAttendance: false,
        canManageUsers: false,
      };
    case 'employee':
    default:
      return {
        canManageEmployees: false,
        canViewAllSalaries: false,
        canApproveLeaves: false,
        canManagePayroll: false,
        canManageRecruitment: false,
        canManagePerformance: false,
        canPostAnnouncements: false,
        canDeleteAnnouncements: false,
        canViewAllTimesheets: false,
        canLogManualAttendance: false,
        canManageUsers: false,
      };
  }
};

export interface NewUserInput {
  name: string;
  email: string;
  jobTitle: string;
  department: Employee['department'];
  password: string;
  role: UserRole;
}

type Result = { ok: boolean; error?: string };

interface HRContextType {
  // Authentication
  isAuthenticated: boolean;
  login: (email: string, password: string) => { ok: boolean; error?: string };
  loginAs: (empId: string) => void;
  logout: () => void;

  // User accounts (admin only)
  accounts: UserAccount[];
  signedInUser: Employee | null;
  createUser: (input: NewUserInput) => Result;
  grantAccess: (employeeId: string, password: string, role: UserRole) => Result;
  setUserRole: (employeeId: string, role: UserRole) => Result;
  setAccountStatus: (employeeId: string, status: AccountStatus) => Result;
  resetUserPassword: (employeeId: string, password: string) => Result;
  revokeAccess: (employeeId: string) => Result;

  // Current user, role & permissions
  activeUser: Employee;
  currentRole: UserRole;
  permissions: RolePermissions;
  switchActiveUser: (empId: string) => void;
  switchRole: (role: UserRole) => void;

  // Clock state
  isClockedIn: boolean;
  clockInTime: string | null;
  elapsedSeconds: number;
  toggleClock: () => void;

  // Employees
  employees: Employee[];
  addEmployee: (emp: Omit<Employee, 'id' | 'employeeCode'>) => Employee;
  updateEmployee: (id: string, updates: Partial<Employee>) => void;
  deleteEmployee: (id: string) => void;
  getEmployeeById: (id: string) => Employee | undefined;

  // Leave Management
  leaveRequests: LeaveRequest[];
  submitLeaveRequest: (req: {
    employeeId: string;
    type: LeaveType;
    startDate: string;
    endDate: string;
    reason: string;
  }) => void;
  approveLeaveRequest: (id: string, comment?: string) => void;
  rejectLeaveRequest: (id: string, comment?: string) => void;

  // Attendance
  attendanceRecords: AttendanceRecord[];
  addManualAttendance: (record: Omit<AttendanceRecord, 'id'>) => void;

  // Payroll
  payrollRecords: PayrollRecord[];
  runPayrollBatch: (period: string) => void;
  markPayrollPaid: (id: string) => void;

  // Recruitment
  jobPostings: JobPosting[];
  jobApplicants: JobApplicant[];
  addJobPosting: (job: Omit<JobPosting, 'id' | 'applicantsCount' | 'postedDate'>) => void;
  updateJobStatus: (id: string, status: 'open' | 'draft' | 'closed') => void;
  addApplicant: (applicant: Omit<JobApplicant, 'id' | 'appliedDate'>) => void;
  updateApplicantStage: (id: string, stage: ApplicantStage) => void;
  updateApplicantRating: (id: string, rating: number) => void;

  // Performance
  performanceReviews: PerformanceReview[];
  updateGoalProgress: (reviewId: string, kpiId: string, progress: number) => void;
  addPerformanceReview: (review: Omit<PerformanceReview, 'id' | 'reviewDate'>) => void;

  // Announcements
  announcements: Announcement[];
  addAnnouncement: (announcement: Omit<Announcement, 'id' | 'date'>) => void;
  deleteAnnouncement: (id: string) => void;

  // Data Export & Reset
  exportCSV: (type: 'employees' | 'payroll' | 'attendance') => void;
  resetDemoData: () => void;
}

const HRContext = createContext<HRContextType | undefined>(undefined);

const STORAGE_KEYS = {
  EMPLOYEES: 'kore_hr_employees_v1',
  LEAVES: 'kore_hr_leaves_v1',
  ATTENDANCE: 'kore_hr_attendance_v1',
  PAYROLL: 'kore_hr_payroll_v1',
  JOBS: 'kore_hr_jobs_v1',
  APPLICANTS: 'kore_hr_applicants_v1',
  REVIEWS: 'kore_hr_reviews_v1',
  ANNOUNCEMENTS: 'kore_hr_announcements_v1',
  CLOCK_STATE: 'kore_hr_clock_state_v1',
  AUTH: 'kore_hr_auth_user_v1',
  ACCOUNTS: 'kore_hr_accounts_v1',
};

const today = () => new Date().toISOString().split('T')[0];

// Shared demo credential. In a real deployment this would be replaced by a
// proper identity provider; here every seeded account signs in with it.
export const DEMO_PASSWORD = 'hr2026';

// Every seeded employee gets a login with the shared demo password.
const seedAccounts = (emps: Employee[]): UserAccount[] =>
  emps.map((e) => ({
    employeeId: e.id,
    passwordHash: hashPassword(e.id, DEMO_PASSWORD),
    status: 'active',
    createdAt: e.startDate,
    createdBy: 'System',
  }));

export const HRProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Load from localStorage or fallback
  const [employees, setEmployees] = useState<Employee[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.EMPLOYEES);
    if (!saved) return INITIAL_EMPLOYEES;
    const list: Employee[] = JSON.parse(saved);
    // Data saved before user accounts existed has no administrator; add the seed one once.
    if (!localStorage.getItem(STORAGE_KEYS.ACCOUNTS) && !list.some((e) => e.privilegeRole === 'admin')) {
      return [...list, SEED_ADMIN];
    }
    return list;
  });

  const [accounts, setAccounts] = useState<UserAccount[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.ACCOUNTS);
    if (saved) return JSON.parse(saved);
    // First run with accounts: keep every existing employee able to sign in as before.
    const savedEmps = localStorage.getItem(STORAGE_KEYS.EMPLOYEES);
    const emps: Employee[] = savedEmps ? JSON.parse(savedEmps) : INITIAL_EMPLOYEES;
    return seedAccounts(emps.some((e) => e.privilegeRole === 'admin') ? emps : [...emps, SEED_ADMIN]);
  });

  const [leaveRequests, setLeaveRequests] = useState<LeaveRequest[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.LEAVES);
    return saved ? JSON.parse(saved) : INITIAL_LEAVE_REQUESTS;
  });

  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.ATTENDANCE);
    return saved ? JSON.parse(saved) : INITIAL_ATTENDANCE;
  });

  const [payrollRecords, setPayrollRecords] = useState<PayrollRecord[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.PAYROLL);
    return saved ? JSON.parse(saved) : INITIAL_PAYROLL;
  });

  const [jobPostings, setJobPostings] = useState<JobPosting[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.JOBS);
    return saved ? JSON.parse(saved) : INITIAL_JOBS;
  });

  const [jobApplicants, setJobApplicants] = useState<JobApplicant[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.APPLICANTS);
    return saved ? JSON.parse(saved) : INITIAL_APPLICANTS;
  });

  const [performanceReviews, setPerformanceReviews] = useState<PerformanceReview[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.REVIEWS);
    return saved ? JSON.parse(saved) : INITIAL_REVIEWS;
  });

  const [announcements, setAnnouncements] = useState<Announcement[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.ANNOUNCEMENTS);
    return saved ? JSON.parse(saved) : INITIAL_ANNOUNCEMENTS;
  });

  // Authentication state
  const [authUserId, setAuthUserId] = useState<string | null>(() => {
    return localStorage.getItem(STORAGE_KEYS.AUTH);
  });

  const getAccount = (empId: string | null) => (empId ? accounts.find((a) => a.employeeId === empId) : undefined);

  const signedInUser = employees.find((e) => e.id === authUserId) || null;
  const isAuthenticated = signedInUser !== null && getAccount(signedInUser.id)?.status === 'active';
  const signedInIsAdmin = isAuthenticated && signedInUser?.privilegeRole === 'admin';

  // Current active user selection with local storage persistence. Only an admin may
  // "view as" another persona; everyone else always acts as themselves.
  const [activeUserId, setActiveUserId] = useState<string>(() => {
    return localStorage.getItem('isoft_active_user_id') || 'emp-1';
  });

  const effectiveUserId = signedInIsAdmin ? activeUserId : authUserId || activeUserId;
  const activeUser = employees.find((e) => e.id === effectiveUserId) || employees[0] || INITIAL_EMPLOYEES[0];
  const currentRole: UserRole = activeUser.privilegeRole || 'employee';
  const permissions: RolePermissions = getPermissionsForRole(currentRole);

  const switchActiveUser = (empId: string) => {
    setActiveUserId(empId);
    localStorage.setItem('isoft_active_user_id', empId);
  };

  const switchRole = (role: UserRole) => {
    if (!signedInIsAdmin || !signedInUser) return;
    if (signedInUser.privilegeRole === role) {
      switchActiveUser(signedInUser.id);
      return;
    }
    const matchedEmp = employees.find((e) => e.privilegeRole === role);
    if (matchedEmp) {
      switchActiveUser(matchedEmp.id);
    }
  };

  const loginAs = (empId: string) => {
    const emp = employees.find((e) => e.id === empId);
    if (!emp || getAccount(emp.id)?.status !== 'active') return;
    setAuthUserId(emp.id);
    localStorage.setItem(STORAGE_KEYS.AUTH, emp.id);
    switchActiveUser(emp.id);
    setAccounts((prev) =>
      prev.map((a) => (a.employeeId === emp.id ? { ...a, lastLoginAt: new Date().toISOString() } : a))
    );
  };

  const login = (email: string, password: string): Result => {
    const normalized = email.trim().toLowerCase();
    if (!normalized || !password) {
      return { ok: false, error: 'Enter both your work email and password.' };
    }
    const emp = employees.find((e) => e.email.toLowerCase() === normalized);
    const account = emp && getAccount(emp.id);
    if (!emp || !account) {
      return { ok: false, error: 'No login exists for that work email. Ask your administrator for access.' };
    }
    if (account.passwordHash !== hashPassword(emp.id, password)) {
      return { ok: false, error: 'Incorrect password. Please try again.' };
    }
    if (account.status !== 'active') {
      return { ok: false, error: 'This account has been disabled. Contact your administrator.' };
    }
    loginAs(emp.id);
    return { ok: true };
  };

  const logout = () => {
    setAuthUserId(null);
    localStorage.removeItem(STORAGE_KEYS.AUTH);
  };

  // User account administration. Every action re-checks that the signed-in
  // person (not a persona being viewed) is an administrator.
  const requireAdmin = (): Result | null =>
    signedInIsAdmin ? null : { ok: false, error: 'Only a system administrator can manage user accounts.' };

  const validatePassword = (password: string): Result | null =>
    password.length < MIN_PASSWORD_LENGTH
      ? { ok: false, error: `Password must be at least ${MIN_PASSWORD_LENGTH} characters.` }
      : null;

  // Blocks any change that would leave the company without an active administrator.
  const lastAdminGuard = (employeeId: string): Result | null => {
    const emp = employees.find((e) => e.id === employeeId);
    if (emp?.privilegeRole !== 'admin' || getAccount(employeeId)?.status !== 'active') return null;
    const otherAdmins = employees.filter(
      (e) => e.id !== employeeId && e.privilegeRole === 'admin' && getAccount(e.id)?.status === 'active'
    );
    return otherAdmins.length === 0 ? { ok: false, error: 'At least one active administrator must remain.' } : null;
  };

  const newAccount = (employeeId: string, password: string): UserAccount => ({
    employeeId,
    passwordHash: hashPassword(employeeId, password),
    status: 'active',
    createdAt: today(),
    createdBy: signedInUser?.name || 'System',
  });

  const createUser = (input: NewUserInput): Result => {
    const denied = requireAdmin();
    if (denied) return denied;
    const name = input.name.trim();
    const email = input.email.trim().toLowerCase();
    if (!name || !email || !input.jobTitle.trim()) {
      return { ok: false, error: 'Name, work email and job title are required.' };
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return { ok: false, error: 'Enter a valid email address.' };
    }
    if (employees.some((e) => e.email.toLowerCase() === email)) {
      return { ok: false, error: 'That email already belongs to an employee. Use "Existing employee" instead.' };
    }
    const weak = validatePassword(input.password);
    if (weak) return weak;

    const emp = addEmployee({
      name,
      email,
      phone: '',
      role: input.jobTitle.trim(),
      privilegeRole: input.role,
      department: input.department,
      employmentType: 'full_time',
      workMode: 'onsite',
      status: 'active',
      salary: 0,
      startDate: today(),
      managerName: '',
      location: '',
      emergencyContact: { name: '', relationship: '', phone: '' },
      leaveBalances: {
        annualTotal: 20,
        annualUsed: 0,
        sickTotal: 10,
        sickUsed: 0,
        personalTotal: 5,
        personalUsed: 0,
      },
    });
    setAccounts((prev) => [...prev, newAccount(emp.id, input.password)]);
    return { ok: true };
  };

  const grantAccess = (employeeId: string, password: string, role: UserRole): Result => {
    const denied = requireAdmin();
    if (denied) return denied;
    if (!employees.some((e) => e.id === employeeId)) return { ok: false, error: 'Select an employee.' };
    if (getAccount(employeeId)) return { ok: false, error: 'This employee already has a login.' };
    const weak = validatePassword(password);
    if (weak) return weak;
    updateEmployee(employeeId, { privilegeRole: role });
    setAccounts((prev) => [...prev, newAccount(employeeId, password)]);
    return { ok: true };
  };

  const setUserRole = (employeeId: string, role: UserRole): Result => {
    const denied = requireAdmin();
    if (denied) return denied;
    if (role !== 'admin') {
      const guard = lastAdminGuard(employeeId);
      if (guard) return guard;
    }
    updateEmployee(employeeId, { privilegeRole: role });
    return { ok: true };
  };

  const setAccountStatus = (employeeId: string, status: AccountStatus): Result => {
    const denied = requireAdmin();
    if (denied) return denied;
    if (status === 'disabled') {
      if (employeeId === authUserId) return { ok: false, error: 'You cannot disable your own account.' };
      const guard = lastAdminGuard(employeeId);
      if (guard) return guard;
    }
    setAccounts((prev) => prev.map((a) => (a.employeeId === employeeId ? { ...a, status } : a)));
    return { ok: true };
  };

  const resetUserPassword = (employeeId: string, password: string): Result => {
    const denied = requireAdmin();
    if (denied) return denied;
    const weak = validatePassword(password);
    if (weak) return weak;
    setAccounts((prev) =>
      prev.map((a) => (a.employeeId === employeeId ? { ...a, passwordHash: hashPassword(employeeId, password) } : a))
    );
    return { ok: true };
  };

  const revokeAccess = (employeeId: string): Result => {
    const denied = requireAdmin();
    if (denied) return denied;
    if (employeeId === authUserId) return { ok: false, error: 'You cannot remove your own login.' };
    const guard = lastAdminGuard(employeeId);
    if (guard) return guard;
    setAccounts((prev) => prev.filter((a) => a.employeeId !== employeeId));
    return { ok: true };
  };

  // Active clock-in simulation
  const [isClockedIn, setIsClockedIn] = useState<boolean>(true);
  const [clockInTime, setClockInTime] = useState<string | null>('08:45 AM');
  const [elapsedSeconds, setElapsedSeconds] = useState<number>(16200); // 4.5 hrs initial

  // Save changes to localStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.EMPLOYEES, JSON.stringify(employees));
  }, [employees]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.LEAVES, JSON.stringify(leaveRequests));
  }, [leaveRequests]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.ATTENDANCE, JSON.stringify(attendanceRecords));
  }, [attendanceRecords]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.PAYROLL, JSON.stringify(payrollRecords));
  }, [payrollRecords]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.JOBS, JSON.stringify(jobPostings));
  }, [jobPostings]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.APPLICANTS, JSON.stringify(jobApplicants));
  }, [jobApplicants]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.REVIEWS, JSON.stringify(performanceReviews));
  }, [performanceReviews]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.ANNOUNCEMENTS, JSON.stringify(announcements));
  }, [announcements]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.ACCOUNTS, JSON.stringify(accounts));
  }, [accounts]);

  // Session timer when clocked in
  useEffect(() => {
    let timer: any;
    if (isClockedIn) {
      timer = setInterval(() => {
        setElapsedSeconds((prev) => prev + 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [isClockedIn]);

  // Clock in / out toggle
  const toggleClock = () => {
    const now = new Date();
    const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const today = now.toISOString().split('T')[0];

    if (!isClockedIn) {
      setIsClockedIn(true);
      setClockInTime(timeStr);
      setElapsedSeconds(0);

      // update or create attendance record
      setAttendanceRecords((prev) => {
        const existing = prev.find((a) => a.employeeId === activeUser.id && a.date === today);
        if (existing) {
          return prev.map((a) => (a.id === existing.id ? { ...a, clockIn: timeStr, status: 'present' } : a));
        }
        return [
          {
            id: `att-${Date.now()}`,
            employeeId: activeUser.id,
            employeeName: activeUser.name,
            department: activeUser.department,
            date: today,
            clockIn: timeStr,
            clockOut: '',
            totalHours: 0.1,
            overtimeHours: 0,
            status: 'present',
            location: activeUser.workMode,
            notes: 'Clocked in via dashboard',
          },
          ...prev,
        ];
      });
    } else {
      setIsClockedIn(false);
      const hours = Number((elapsedSeconds / 3600).toFixed(1));
      const overtime = Math.max(0, Number((hours - 8).toFixed(1)));

      setAttendanceRecords((prev) => {
        return prev.map((a) => {
          if (a.employeeId === activeUser.id && a.date === today) {
            return {
              ...a,
              clockOut: timeStr,
              totalHours: hours,
              overtimeHours: overtime,
            };
          }
          return a;
        });
      });
    }
  };

  // Employee CRUD
  const addEmployee = (data: Omit<Employee, 'id' | 'employeeCode'>) => {
    const nextCodeNum = 100 + employees.length + 1;
    const newEmp: Employee = {
      ...data,
      id: `emp-${Date.now()}`,
      employeeCode: `EMP-${nextCodeNum}`,
      privilegeRole: data.privilegeRole || 'employee',
      leaveBalances: data.leaveBalances || {
        annualTotal: 20,
        annualUsed: 0,
        sickTotal: 10,
        sickUsed: 0,
        personalTotal: 5,
        personalUsed: 0,
      },
    };
    setEmployees((prev) => [newEmp, ...prev]);
    return newEmp;
  };

  const updateEmployee = (id: string, updates: Partial<Employee>) => {
    const current = employees.find((e) => e.id === id);
    if (updates.privilegeRole && current && updates.privilegeRole !== current.privilegeRole) {
      // Only an administrator may change roles, and never demote the last admin.
      const blocked = !signedInIsAdmin || (updates.privilegeRole !== 'admin' && lastAdminGuard(id));
      if (blocked) {
        const { privilegeRole: _ignored, ...rest } = updates;
        updates = rest;
      }
    }
    setEmployees((prev) => prev.map((emp) => (emp.id === id ? { ...emp, ...updates } : emp)));
  };

  const deleteEmployee = (id: string) => {
    // Never remove the signed-in person or the last administrator.
    if (id === authUserId || lastAdminGuard(id)) return;
    setEmployees((prev) => prev.filter((emp) => emp.id !== id));
    setAccounts((prev) => prev.filter((a) => a.employeeId !== id));
  };

  const getEmployeeById = (id: string) => {
    return employees.find((e) => e.id === id);
  };

  // Leave Management
  const submitLeaveRequest = (req: {
    employeeId: string;
    type: LeaveType;
    startDate: string;
    endDate: string;
    reason: string;
  }) => {
    const emp = getEmployeeById(req.employeeId) || activeUser;
    const start = new Date(req.startDate);
    const end = new Date(req.endDate);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const days = Math.max(1, Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1);

    const newLeave: LeaveRequest = {
      id: `leave-${Date.now()}`,
      employeeId: emp.id,
      employeeName: emp.name,
      employeeRole: emp.role,
      department: emp.department,
      avatarUrl: emp.avatarUrl,
      type: req.type,
      startDate: req.startDate,
      endDate: req.endDate,
      days,
      reason: req.reason,
      status: 'pending',
      requestedAt: new Date().toISOString().split('T')[0],
    };

    setLeaveRequests((prev) => [newLeave, ...prev]);
  };

  const approveLeaveRequest = (id: string, comment?: string) => {
    setLeaveRequests((prev) =>
      prev.map((req) => {
        if (req.id === id) {
          // Deduct from employee balance
          setEmployees((empList) =>
            empList.map((emp) => {
              if (emp.id === req.employeeId) {
                const bal = { ...emp.leaveBalances };
                if (req.type === 'annual') bal.annualUsed += req.days;
                if (req.type === 'sick') bal.sickUsed += req.days;
                if (req.type === 'personal') bal.personalUsed += req.days;
                return { ...emp, leaveBalances: bal };
              }
              return emp;
            })
          );

          return {
            ...req,
            status: 'approved',
            reviewedAt: new Date().toISOString().split('T')[0],
            reviewedBy: activeUser.name,
            reviewComment: comment || 'Approved by People Operations',
          };
        }
        return req;
      })
    );
  };

  const rejectLeaveRequest = (id: string, comment?: string) => {
    setLeaveRequests((prev) =>
      prev.map((req) => {
        if (req.id === id) {
          return {
            ...req,
            status: 'rejected',
            reviewedAt: new Date().toISOString().split('T')[0],
            reviewedBy: activeUser.name,
            reviewComment: comment || 'Rejected due to project critical coverage',
          };
        }
        return req;
      })
    );
  };

  // Attendance
  const addManualAttendance = (record: Omit<AttendanceRecord, 'id'>) => {
    const newRecord: AttendanceRecord = {
      ...record,
      id: `att-${Date.now()}`,
    };
    setAttendanceRecords((prev) => [newRecord, ...prev]);
  };

  // Payroll
  const runPayrollBatch = (period: string) => {
    // Generate payroll records for all active employees
    const newRecords: PayrollRecord[] = employees
      .filter((e) => e.status !== 'offboarded')
      .map((emp) => {
        const monthlyBase = Math.round(emp.salary / 12);
        const allowances = emp.employmentType === 'full_time' ? 400 : 0;
        const grossPay = monthlyBase + allowances;
        const taxDeduction = Math.round(grossPay * 0.22);
        const benefitsDeduction = emp.employmentType === 'full_time' ? Math.round(grossPay * 0.045) : 0;
        const netPay = grossPay - taxDeduction - benefitsDeduction;

        return {
          id: `pay-${emp.id}-${Date.now()}`,
          payPeriod: period,
          employeeId: emp.id,
          employeeName: emp.name,
          department: emp.department,
          role: emp.role,
          baseSalary: monthlyBase,
          allowances,
          grossPay,
          taxDeduction,
          benefitsDeduction,
          netPay,
          paymentDate: new Date().toISOString().split('T')[0],
          status: 'paid',
          paymentMethod: 'Direct Deposit (ACH Transfer)',
        };
      });

    setPayrollRecords((prev) => [...newRecords, ...prev]);
  };

  const markPayrollPaid = (id: string) => {
    setPayrollRecords((prev) =>
      prev.map((p) => (p.id === id ? { ...p, status: 'paid', paymentDate: new Date().toISOString().split('T')[0] } : p))
    );
  };

  // Recruitment ATS
  const addJobPosting = (job: Omit<JobPosting, 'id' | 'applicantsCount' | 'postedDate'>) => {
    const newJob: JobPosting = {
      ...job,
      id: `job-${Date.now()}`,
      applicantsCount: 0,
      postedDate: new Date().toISOString().split('T')[0],
    };
    setJobPostings((prev) => [newJob, ...prev]);
  };

  const updateJobStatus = (id: string, status: 'open' | 'draft' | 'closed') => {
    setJobPostings((prev) => prev.map((j) => (j.id === id ? { ...j, status } : j)));
  };

  const addApplicant = (applicant: Omit<JobApplicant, 'id' | 'appliedDate'>) => {
    const newApp: JobApplicant = {
      ...applicant,
      id: `app-${Date.now()}`,
      appliedDate: new Date().toISOString().split('T')[0],
    };
    setJobApplicants((prev) => [newApp, ...prev]);
    // increment job applicant count
    setJobPostings((prev) =>
      prev.map((j) => (j.id === applicant.jobId ? { ...j, applicantsCount: j.applicantsCount + 1 } : j))
    );
  };

  const updateApplicantStage = (id: string, stage: ApplicantStage) => {
    setJobApplicants((prev) => prev.map((a) => (a.id === id ? { ...a, stage } : a)));
  };

  const updateApplicantRating = (id: string, rating: number) => {
    setJobApplicants((prev) => prev.map((a) => (a.id === id ? { ...a, rating } : a)));
  };

  // Performance
  const updateGoalProgress = (reviewId: string, kpiId: string, progress: number) => {
    setPerformanceReviews((prev) =>
      prev.map((r) => {
        if (r.id === reviewId) {
          const updatedKpis = r.kpis.map((kpi) =>
            kpi.id === kpiId
              ? {
                  ...kpi,
                  progress,
                  status: progress >= 100 ? ('completed' as const) : progress < 50 ? ('at_risk' as const) : ('on_track' as const),
                }
              : kpi
          );
          return { ...r, kpis: updatedKpis };
        }
        return r;
      })
    );
  };

  const addPerformanceReview = (review: Omit<PerformanceReview, 'id' | 'reviewDate'>) => {
    const newReview: PerformanceReview = {
      ...review,
      id: `rev-${Date.now()}`,
      reviewDate: new Date().toISOString().split('T')[0],
    };
    setPerformanceReviews((prev) => [newReview, ...prev]);
  };

  // Announcements
  const addAnnouncement = (ann: Omit<Announcement, 'id' | 'date'>) => {
    const newAnn: Announcement = {
      ...ann,
      id: `ann-${Date.now()}`,
      date: new Date().toISOString().split('T')[0],
    };
    setAnnouncements((prev) => [newAnn, ...prev]);
  };

  const deleteAnnouncement = (id: string) => {
    setAnnouncements((prev) => prev.filter((a) => a.id !== id));
  };

  // Export to CSV helper
  const exportCSV = (type: 'employees' | 'payroll' | 'attendance') => {
    let csvContent = '';
    let filename = '';

    if (type === 'employees') {
      filename = `isoft_employees_${new Date().toISOString().split('T')[0]}.csv`;
      const headers = ['Code', 'Name', 'Role', 'Department', 'Email', 'Phone', 'Type', 'Mode', 'Status', 'Salary', 'Start Date', 'Location'];
      const rows = employees.map((e) => [
        e.employeeCode,
        `"${e.name}"`,
        `"${e.role}"`,
        `"${e.department}"`,
        e.email,
        e.phone,
        e.employmentType,
        e.workMode,
        e.status,
        e.salary,
        e.startDate,
        `"${e.location}"`,
      ]);
      csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    } else if (type === 'payroll') {
      filename = `isoft_payroll_${new Date().toISOString().split('T')[0]}.csv`;
      const headers = ['Period', 'Employee', 'Department', 'Role', 'Base Salary', 'Allowances', 'Gross Pay', 'Tax Deductions', 'Benefits', 'Net Pay', 'Status', 'Payment Date'];
      const rows = payrollRecords.map((p) => [
        `"${p.payPeriod}"`,
        `"${p.employeeName}"`,
        `"${p.department}"`,
        `"${p.role}"`,
        p.baseSalary,
        p.allowances,
        p.grossPay,
        p.taxDeduction,
        p.benefitsDeduction,
        p.netPay,
        p.status,
        p.paymentDate,
      ]);
      csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    } else {
      filename = `isoft_attendance_${new Date().toISOString().split('T')[0]}.csv`;
      const headers = ['Date', 'Employee', 'Department', 'Clock In', 'Clock Out', 'Total Hours', 'Overtime', 'Status', 'Location'];
      const rows = attendanceRecords.map((a) => [
        a.date,
        `"${a.employeeName}"`,
        `"${a.department}"`,
        a.clockIn,
        a.clockOut,
        a.totalHours,
        a.overtimeHours,
        a.status,
        a.location,
      ]);
      csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    }

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const resetDemoData = () => {
    localStorage.clear();
    // Preserve the active sign-in session across a data reset.
    if (authUserId) {
      localStorage.setItem(STORAGE_KEYS.AUTH, authUserId);
    }
    setEmployees(INITIAL_EMPLOYEES);
    setLeaveRequests(INITIAL_LEAVE_REQUESTS);
    setAttendanceRecords(INITIAL_ATTENDANCE);
    setPayrollRecords(INITIAL_PAYROLL);
    setJobPostings(INITIAL_JOBS);
    setJobApplicants(INITIAL_APPLICANTS);
    setPerformanceReviews(INITIAL_REVIEWS);
    setAnnouncements(INITIAL_ANNOUNCEMENTS);
    setAccounts(seedAccounts(INITIAL_EMPLOYEES));
    setIsClockedIn(true);
    setClockInTime('08:45 AM');
    setElapsedSeconds(16200);
  };

  return (
    <HRContext.Provider
      value={{
        isAuthenticated,
        login,
        loginAs,
        logout,
        accounts,
        signedInUser,
        createUser,
        grantAccess,
        setUserRole,
        setAccountStatus,
        resetUserPassword,
        revokeAccess,
        activeUser,
        currentRole,
        permissions,
        switchActiveUser,
        switchRole,
        isClockedIn,
        clockInTime,
        elapsedSeconds,
        toggleClock,
        employees,
        addEmployee,
        updateEmployee,
        deleteEmployee,
        getEmployeeById,
        leaveRequests,
        submitLeaveRequest,
        approveLeaveRequest,
        rejectLeaveRequest,
        attendanceRecords,
        addManualAttendance,
        payrollRecords,
        runPayrollBatch,
        markPayrollPaid,
        jobPostings,
        jobApplicants,
        addJobPosting,
        updateJobStatus,
        addApplicant,
        updateApplicantStage,
        updateApplicantRating,
        performanceReviews,
        updateGoalProgress,
        addPerformanceReview,
        announcements,
        addAnnouncement,
        deleteAnnouncement,
        exportCSV,
        resetDemoData,
      }}
    >
      {children}
    </HRContext.Provider>
  );
};

export const useHR = () => {
  const context = useContext(HRContext);
  if (!context) {
    throw new Error('useHR must be used within an HRProvider');
  }
  return context;
};
