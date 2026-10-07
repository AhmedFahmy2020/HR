export type Department = 
  | 'Engineering' 
  | 'Product & Design' 
  | 'People & HR' 
  | 'Marketing' 
  | 'Sales' 
  | 'Finance & Operations';

export type EmploymentType = 'full_time' | 'part_time' | 'contractor';
export type WorkMode = 'remote' | 'hybrid' | 'onsite';
export type EmployeeStatus = 'active' | 'on_leave' | 'probation' | 'offboarded';

export type UserRole = 'employee' | 'hr' | 'leader' | 'ceo' | 'cto' | 'admin';

export interface RolePermissions {
  canManageEmployees: boolean; // Add, edit profile, offboard
  canViewAllSalaries: boolean; // See compensation of other colleagues
  canApproveLeaves: boolean; // Approve/reject time-off applications
  canManagePayroll: boolean; // Run company payroll batch & view ledger
  canManageRecruitment: boolean; // Create job postings & move candidate pipeline
  canManagePerformance: boolean; // Evaluate direct reports & create review cycles
  canPostAnnouncements: boolean; // Publish official company notices
  canDeleteAnnouncements: boolean; // Remove company notices
  canViewAllTimesheets: boolean; // View logs of other colleagues
  canLogManualAttendance: boolean; // Adjust or log timesheet entries for others
  canManageUsers: boolean; // Create login accounts, assign roles, reset passwords
}

export type AccountStatus = 'active' | 'disabled';

// Login credentials for an employee. The role lives on Employee.privilegeRole so
// every screen keeps reading it from one place; this record only controls access.
export interface UserAccount {
  employeeId: string;
  passwordHash: string;
  status: AccountStatus;
  createdAt: string;
  createdBy: string;
  lastLoginAt?: string;
}

export interface Employee {
  id: string;
  employeeCode: string;
  name: string;
  email: string;
  phone: string;
  role: string;
  privilegeRole: UserRole;
  department: Department;
  avatarUrl?: string;
  employmentType: EmploymentType;
  workMode: WorkMode;
  status: EmployeeStatus;
  salary: number; // annual gross AED
  startDate: string;
  managerName: string;
  location: string;
  emergencyContact: {
    name: string;
    relationship: string;
    phone: string;
  };
  leaveBalances: {
    annualTotal: number;
    annualUsed: number;
    sickTotal: number;
    sickUsed: number;
    personalTotal: number;
    personalUsed: number;
  };
  notes?: string;
}

export type LeaveType = 'annual' | 'sick' | 'personal' | 'parental' | 'bereavement' | 'unpaid';
export type LeaveStatus = 'pending' | 'approved' | 'rejected';

export interface LeaveRequest {
  id: string;
  employeeId: string;
  employeeName: string;
  employeeRole: string;
  department: Department;
  avatarUrl?: string;
  type: LeaveType;
  startDate: string;
  endDate: string;
  days: number;
  reason: string;
  status: LeaveStatus;
  requestedAt: string;
  reviewedAt?: string;
  reviewedBy?: string;
  reviewComment?: string;
}

export type AttendanceStatus = 'present' | 'late' | 'half_day' | 'absent' | 'on_leave';

export interface AttendanceRecord {
  id: string;
  employeeId: string;
  employeeName: string;
  department: Department;
  date: string;
  clockIn: string; // "08:58 AM" or empty
  clockOut: string; // "05:02 PM" or empty
  totalHours: number;
  overtimeHours: number;
  status: AttendanceStatus;
  location: WorkMode;
  notes?: string;
}

export type PayrollStatus = 'paid' | 'processing' | 'draft';

export interface PayrollRecord {
  id: string;
  payPeriod: string; // e.g. "October 2026"
  employeeId: string;
  employeeName: string;
  department: Department;
  role: string;
  baseSalary: number; // monthly base
  allowances: number; // transit/health/stipend
  grossPay: number;
  taxDeduction: number;
  benefitsDeduction: number; // health/401k
  netPay: number;
  paymentDate: string;
  status: PayrollStatus;
  paymentMethod: string;
}

export type JobStatus = 'open' | 'draft' | 'closed';

export interface JobPosting {
  id: string;
  title: string;
  department: Department;
  location: string;
  workMode: WorkMode;
  type: EmploymentType;
  salaryRange: string;
  status: JobStatus;
  applicantsCount: number;
  postedDate: string;
  description: string;
  requirements: string[];
}

export type ApplicantStage = 'applied' | 'screening' | 'interview' | 'offer' | 'hired' | 'rejected';

export interface JobApplicant {
  id: string;
  jobId: string;
  jobTitle: string;
  name: string;
  email: string;
  phone: string;
  appliedDate: string;
  stage: ApplicantStage;
  rating: number; // 1-5
  experienceYears: number;
  portfolioUrl?: string;
  notes: string;
}

export interface KPIItem {
  id: string;
  title: string;
  progress: number; // 0-100
  targetDate: string;
  status: 'on_track' | 'at_risk' | 'completed';
}

export interface PerformanceReview {
  id: string;
  employeeId: string;
  employeeName: string;
  role: string;
  department: Department;
  cycle: string; // e.g. "Q3 2026 Growth Review"
  score: number; // 1 to 5
  reviewerName: string;
  reviewDate: string;
  summary: string;
  strengths: string[];
  growthAreas: string[];
  kpis: KPIItem[];
}

export interface Announcement {
  id: string;
  title: string;
  content: string;
  author: string;
  authorRole: string;
  date: string;
  priority: 'normal' | 'important' | 'urgent';
  department: string;
}
