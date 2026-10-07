import React, { useState } from 'react';
import { useHR } from '../../context/HRContext';
import { Department, EmploymentType, WorkMode, EmployeeStatus, UserRole } from '../../types/hr';
import { X, Check } from 'lucide-react';

interface NewEmployeeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (empId: string) => void;
}

export const NewEmployeeModal: React.FC<NewEmployeeModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const { addEmployee, employees } = useHR();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    role: '',
    privilegeRole: 'employee' as UserRole,
    department: 'Engineering' as Department,
    employmentType: 'full_time' as EmploymentType,
    workMode: 'hybrid' as WorkMode,
    status: 'active' as EmployeeStatus,
    salary: 130000,
    startDate: new Date().toISOString().split('T')[0],
    managerName: employees[0]?.name || 'Sarah Jenkins',
    location: 'San Francisco, CA',
    emergencyContactName: '',
    emergencyRelationship: 'Spouse',
    emergencyPhone: '',
    notes: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) newErrors.name = 'Full name is required';
    if (!formData.email.trim()) newErrors.email = 'Work email is required';
    if (!formData.role.trim()) newErrors.role = 'Job title/role is required';
    if (formData.salary <= 0) newErrors.salary = 'Salary must be greater than 0';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    const created = addEmployee({
      name: formData.name.trim(),
      email: formData.email.trim().toLowerCase(),
      phone: formData.phone.trim() || '+1 (555) 000-0000',
      role: formData.role.trim(),
      privilegeRole: formData.privilegeRole,
      department: formData.department,
      employmentType: formData.employmentType,
      workMode: formData.workMode,
      status: formData.status,
      salary: Number(formData.salary),
      startDate: formData.startDate,
      managerName: formData.managerName,
      location: formData.location.trim() || 'Remote',
      emergencyContact: {
        name: formData.emergencyContactName.trim() || 'Not specified',
        relationship: formData.emergencyRelationship,
        phone: formData.emergencyPhone.trim() || 'N/A',
      },
      leaveBalances: {
        annualTotal: 20,
        annualUsed: 0,
        sickTotal: 10,
        sickUsed: 0,
        personalTotal: 5,
        personalUsed: 0,
      },
      notes: formData.notes.trim(),
    });

    onSuccess(created.id);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-xl shadow-2xl border border-neutral-200 w-full max-w-2xl overflow-hidden max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-200 bg-neutral-50/50">
          <div>
            <h3 className="text-base font-bold text-neutral-900 tracking-tight">
              Onboard New Employee
            </h3>
            <p className="text-xs text-neutral-500 mt-0.5">
              Enter personnel information to provision profile, payroll & leave balances
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4 text-xs">
          {/* Row 1: Name and Email */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-neutral-700 mb-1">
                Full Legal Name *
              </label>
              <input
                type="text"
                placeholder="e.g. Rachel Adams"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className={`w-full px-3 py-2 bg-neutral-50 border rounded-lg focus:outline-none focus:ring-1 focus:ring-neutral-900 transition-colors ${
                  errors.name ? 'border-rose-500' : 'border-neutral-200'
                }`}
              />
              {errors.name && <p className="text-rose-600 text-xs mt-1">{errors.name}</p>}
            </div>

            <div>
              <label className="block font-semibold text-neutral-700 mb-1">
                Work Email Address *
              </label>
              <input
                type="email"
                placeholder="rachel.adams@isoft.internal"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className={`w-full px-3 py-2 bg-neutral-50 border rounded-lg focus:outline-none focus:ring-1 focus:ring-neutral-900 transition-colors ${
                  errors.email ? 'border-rose-500' : 'border-neutral-200'
                }`}
              />
              {errors.email && <p className="text-rose-600 text-xs mt-1">{errors.email}</p>}
            </div>
          </div>

          {/* Row 2: Role and Department */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-neutral-700 mb-1">
                Job Title / Position *
              </label>
              <input
                type="text"
                placeholder="e.g. Senior Backend Engineer"
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                className={`w-full px-3 py-2 bg-neutral-50 border rounded-lg focus:outline-none focus:ring-1 focus:ring-neutral-900 transition-colors ${
                  errors.role ? 'border-rose-500' : 'border-neutral-200'
                }`}
              />
              {errors.role && <p className="text-rose-600 text-xs mt-1">{errors.role}</p>}
            </div>

            <div>
              <label className="block font-semibold text-neutral-700 mb-1">
                Department
              </label>
              <select
                value={formData.department}
                onChange={(e) => setFormData({ ...formData, department: e.target.value as Department })}
                className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-neutral-900 transition-colors cursor-pointer"
              >
                <option value="Engineering">Engineering</option>
                <option value="Product & Design">Product & Design</option>
                <option value="People & HR">People & HR</option>
                <option value="Marketing">Marketing</option>
                <option value="Sales">Sales</option>
                <option value="Finance & Operations">Finance & Operations</option>
              </select>
            </div>
          </div>

          {/* Row 2.5: Privilege & Access Level */}
          <div>
            <label className="block font-semibold text-neutral-700 mb-1">
              Privilege & Access Level *
            </label>
            <select
              value={formData.privilegeRole}
              onChange={(e) => setFormData({ ...formData, privilegeRole: e.target.value as UserRole })}
              className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-neutral-900 transition-colors cursor-pointer"
            >
              <option value="employee">Employee — Individual contributor self-service workspace</option>
              <option value="leader">Leader — Team Lead / Department approver (approvals, reviews, candidate ratings)</option>
              <option value="hr">HR Team — People & Operations (full directory, recruitment ATS, leaves, payroll)</option>
              <option value="cto">CTO — Chief Technology Officer (technical org authority, engineering hiring, tech salary insights)</option>
              <option value="ceo">CEO — Chief Executive Officer (complete enterprise authority, payroll execution, global approvals)</option>
            </select>
          </div>

          {/* Row 3: Employment Type, Work Mode, Annual Salary */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block font-semibold text-neutral-700 mb-1">
                Employment Type
              </label>
              <select
                value={formData.employmentType}
                onChange={(e) => setFormData({ ...formData, employmentType: e.target.value as EmploymentType })}
                className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-neutral-900 transition-colors cursor-pointer"
              >
                <option value="full_time">Full-Time</option>
                <option value="part_time">Part-Time</option>
                <option value="contractor">Contractor</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-neutral-700 mb-1">
                Work Mode
              </label>
              <select
                value={formData.workMode}
                onChange={(e) => setFormData({ ...formData, workMode: e.target.value as WorkMode })}
                className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-neutral-900 transition-colors cursor-pointer"
              >
                <option value="hybrid">Hybrid</option>
                <option value="remote">Remote</option>
                <option value="onsite">Onsite</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-neutral-700 mb-1">
                Annual Salary (AED) *
              </label>
              <input
                type="number"
                min="10000"
                step="1000"
                value={formData.salary}
                onChange={(e) => setFormData({ ...formData, salary: Number(e.target.value) })}
                className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-neutral-900 transition-colors font-mono tabular-nums"
              />
            </div>
          </div>

          {/* Row 4: Location, Start Date, Manager */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block font-semibold text-neutral-700 mb-1">
                Base Location
              </label>
              <input
                type="text"
                placeholder="e.g. San Francisco, CA"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-neutral-900 transition-colors"
              />
            </div>

            <div>
              <label className="block font-semibold text-neutral-700 mb-1">
                Start Date
              </label>
              <input
                type="date"
                value={formData.startDate}
                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-neutral-900 transition-colors font-mono"
              />
            </div>

            <div>
              <label className="block font-semibold text-neutral-700 mb-1">
                Direct Manager
              </label>
              <input
                type="text"
                placeholder="Manager name"
                value={formData.managerName}
                onChange={(e) => setFormData({ ...formData, managerName: e.target.value })}
                className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-neutral-900 transition-colors"
              />
            </div>
          </div>

          {/* Emergency Contact */}
          <div className="p-3 bg-neutral-50 rounded-lg border border-neutral-200/80 space-y-3">
            <span className="font-semibold text-neutral-800 block">
              Emergency Contact Information
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-neutral-600 mb-1">Contact Name</label>
                <input
                  type="text"
                  placeholder="Primary contact"
                  value={formData.emergencyContactName}
                  onChange={(e) => setFormData({ ...formData, emergencyContactName: e.target.value })}
                  className="w-full px-2.5 py-1.5 bg-white border border-neutral-200 rounded-md focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-neutral-600 mb-1">Relationship</label>
                <select
                  value={formData.emergencyRelationship}
                  onChange={(e) => setFormData({ ...formData, emergencyRelationship: e.target.value })}
                  className="w-full px-2.5 py-1.5 bg-white border border-neutral-200 rounded-md focus:outline-none cursor-pointer"
                >
                  <option value="Spouse">Spouse</option>
                  <option value="Partner">Partner</option>
                  <option value="Parent">Parent</option>
                  <option value="Sibling">Sibling</option>
                  <option value="Friend">Friend</option>
                </select>
              </div>
              <div>
                <label className="block text-neutral-600 mb-1">Phone Number</label>
                <input
                  type="text"
                  placeholder="+1 (555) 000-0000"
                  value={formData.emergencyPhone}
                  onChange={(e) => setFormData({ ...formData, emergencyPhone: e.target.value })}
                  className="w-full px-2.5 py-1.5 bg-white border border-neutral-200 rounded-md focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block font-semibold text-neutral-700 mb-1">
              Internal HR Notes & Onboarding Instructions
            </label>
            <textarea
              rows={2}
              placeholder="Hardware preferences, equipment shipping address, team introduction notes..."
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-neutral-900 transition-colors"
            />
          </div>

          {/* Submit Action */}
          <div className="pt-4 flex items-center justify-end gap-3 border-t border-neutral-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-neutral-700 bg-neutral-100 hover:bg-neutral-200/80 rounded-lg transition-colors font-medium cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="inline-flex items-center gap-1.5 px-4 py-2 text-white bg-neutral-900 hover:bg-neutral-800 rounded-lg transition-colors font-semibold cursor-pointer shadow-xs"
            >
              <Check className="w-4 h-4" />
              <span>Complete Onboarding</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
