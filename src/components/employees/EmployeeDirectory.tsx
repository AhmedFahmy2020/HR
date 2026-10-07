import React, { useState, useMemo } from 'react';
import { useHR } from '../../context/HRContext';
import { Employee, Department, EmploymentType, WorkMode, EmployeeStatus, UserRole } from '../../types/hr';
import { Avatar } from '../common/Avatar';
import { EmployeeDrawer } from './EmployeeDrawer';
import {
  Search,
  Filter,
  LayoutGrid,
  List,
  Download,
  Plus,
  Mail,
  MapPin,
  ChevronRight,
  ShieldCheck,
  Lock,
  MoreVertical
} from 'lucide-react';
import { formatMoney } from '../../utils/format';

interface EmployeeDirectoryProps {
  onOpenNewEmployee: () => void;
  externalSearch?: string;
}

export const EmployeeDirectory: React.FC<EmployeeDirectoryProps> = ({
  onOpenNewEmployee,
  externalSearch = '',
}) => {
  const { employees, exportCSV, permissions, activeUser, currentRole } = useHR();
  const [search, setSearch] = useState('');
  const [selectedDept, setSelectedDept] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedWorkMode, setSelectedWorkMode] = useState<string>('all');
  const [selectedPrivilege, setSelectedPrivilege] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('table');
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);

  const activeSearch = externalSearch || search;

  const roleMeta: Record<UserRole, { label: string; style: string }> = {
    admin: { label: 'Admin', style: 'bg-rose-100 text-rose-800 border-rose-200' },
    ceo: { label: 'CEO', style: 'bg-purple-100 text-purple-800 border-purple-200' },
    cto: { label: 'CTO', style: 'bg-indigo-100 text-indigo-800 border-indigo-200' },
    hr: { label: 'HR Team', style: 'bg-emerald-100 text-emerald-800 border-emerald-200' },
    leader: { label: 'Leader', style: 'bg-sky-100 text-sky-800 border-sky-200' },
    employee: { label: 'Employee', style: 'bg-neutral-100 text-neutral-700 border-neutral-200' },
  };

  const filteredEmployees = useMemo(() => {
    return employees.filter((emp) => {
      const matchSearch =
        !activeSearch ||
        emp.name.toLowerCase().includes(activeSearch.toLowerCase()) ||
        emp.role.toLowerCase().includes(activeSearch.toLowerCase()) ||
        emp.email.toLowerCase().includes(activeSearch.toLowerCase()) ||
        emp.employeeCode.toLowerCase().includes(activeSearch.toLowerCase()) ||
        emp.location.toLowerCase().includes(activeSearch.toLowerCase());

      const matchDept = selectedDept === 'all' || emp.department === selectedDept;
      const matchStatus = selectedStatus === 'all' || emp.status === selectedStatus;
      const matchWorkMode = selectedWorkMode === 'all' || emp.workMode === selectedWorkMode;
      const matchPrivilege = selectedPrivilege === 'all' || (emp.privilegeRole || 'employee') === selectedPrivilege;

      return matchSearch && matchDept && matchStatus && matchWorkMode && matchPrivilege;
    });
  }, [employees, activeSearch, selectedDept, selectedStatus, selectedWorkMode, selectedPrivilege]);

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Top Controls Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-4 rounded-xl border border-neutral-200/80 shadow-xs">
        {/* Search & Filters */}
        <div className="flex flex-wrap items-center gap-3 flex-1">
          <div className="relative min-w-56 flex-1 sm:flex-initial">
            <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by name, role, email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-neutral-50 hover:bg-neutral-100/60 focus:bg-white border border-neutral-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-neutral-900 transition-colors"
            />
          </div>

          {/* Department Filter */}
          <select
            value={selectedDept}
            onChange={(e) => setSelectedDept(e.target.value)}
            className="px-2.5 py-1.5 text-xs bg-neutral-50 border border-neutral-200 rounded-lg text-neutral-700 focus:outline-none cursor-pointer"
          >
            <option value="all">All Departments</option>
            <option value="Engineering">Engineering</option>
            <option value="Product & Design">Product & Design</option>
            <option value="People & HR">People & HR</option>
            <option value="Marketing">Marketing</option>
            <option value="Sales">Sales</option>
            <option value="Finance & Operations">Finance & Ops</option>
          </select>

          {/* Status Filter */}
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="px-2.5 py-1.5 text-xs bg-neutral-50 border border-neutral-200 rounded-lg text-neutral-700 focus:outline-none cursor-pointer"
          >
            <option value="all">All Statuses</option>
            <option value="active">Active</option>
            <option value="on_leave">On Leave</option>
            <option value="probation">Probation</option>
            <option value="offboarded">Offboarded</option>
          </select>

          {/* Work Mode */}
          <select
            value={selectedWorkMode}
            onChange={(e) => setSelectedWorkMode(e.target.value)}
            className="px-2.5 py-1.5 text-xs bg-neutral-50 border border-neutral-200 rounded-lg text-neutral-700 focus:outline-none cursor-pointer"
          >
            <option value="all">All Modes</option>
            <option value="remote">Remote</option>
            <option value="hybrid">Hybrid</option>
            <option value="onsite">Onsite</option>
          </select>

          {/* Privilege Role Filter */}
          <select
            value={selectedPrivilege}
            onChange={(e) => setSelectedPrivilege(e.target.value)}
            className="px-2.5 py-1.5 text-xs bg-neutral-50 border border-neutral-200 rounded-lg text-neutral-700 focus:outline-none cursor-pointer"
          >
            <option value="all">All Privileges</option>
            <option value="employee">Employee (Staff)</option>
            <option value="leader">Leader (Manager)</option>
            <option value="hr">HR Team</option>
            <option value="cto">CTO</option>
            <option value="ceo">CEO</option>
            <option value="admin">Admin</option>
          </select>
        </div>

        {/* View Switcher & Action buttons */}
        <div className="flex items-center gap-2 shrink-0">
          <div className="flex items-center bg-neutral-100 p-0.5 rounded-lg border border-neutral-200/80">
            <button
              onClick={() => setViewMode('table')}
              className={`p-1.5 rounded-md text-xs transition-colors cursor-pointer ${
                viewMode === 'table' ? 'bg-white text-neutral-900 shadow-xs' : 'text-neutral-500 hover:text-neutral-900'
              }`}
              title="Table view"
            >
              <List className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-md text-xs transition-colors cursor-pointer ${
                viewMode === 'grid' ? 'bg-white text-neutral-900 shadow-xs' : 'text-neutral-500 hover:text-neutral-900'
              }`}
              title="Grid cards"
            >
              <LayoutGrid className="w-3.5 h-3.5" />
            </button>
          </div>

          {permissions.canViewAllSalaries && (
            <button
              onClick={() => exportCSV('employees')}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-neutral-700 bg-white border border-neutral-200 rounded-lg hover:bg-neutral-50 transition-colors cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export CSV</span>
            </button>
          )}

          {permissions.canManageEmployees && (
            <button
              onClick={onOpenNewEmployee}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-neutral-900 hover:bg-neutral-800 rounded-lg transition-colors cursor-pointer shadow-xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Member</span>
            </button>
          )}
        </div>
      </div>

      {/* Active Privilege Context Banner */}
      <div className="bg-neutral-50/80 border border-neutral-200/90 rounded-xl px-4 py-2.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-neutral-700" />
          <span className="font-semibold text-neutral-900">
            Active Directory Privilege: <span className="capitalize">{currentRole}</span>
          </span>
          <span className="text-neutral-500 hidden md:inline">
            {currentRole === 'employee'
              ? '· Confidential salaries of colleagues are protected'
              : currentRole === 'leader'
              ? '· Team lead view: Department members visible, peer salaries protected'
              : '· Administrative authority: Full salary access and member management enabled'}
          </span>
        </div>
        <div className="flex items-center gap-1.5 text-2xs font-mono text-neutral-500">
          <span className="px-1.5 py-0.5 rounded bg-white border border-neutral-200">
            {employees.filter((e) => (e.privilegeRole || 'employee') === 'employee').length} Staff
          </span>
          <span className="px-1.5 py-0.5 rounded bg-white border border-neutral-200">
            {employees.filter((e) => e.privilegeRole === 'leader').length} Leaders
          </span>
          <span className="px-1.5 py-0.5 rounded bg-white border border-neutral-200">
            {employees.filter((e) => e.privilegeRole === 'hr').length} HR
          </span>
          <span className="px-1.5 py-0.5 rounded bg-white border border-neutral-200">
            {employees.filter((e) => e.privilegeRole === 'cto' || e.privilegeRole === 'ceo').length} Execs
          </span>
        </div>
      </div>

      {/* Main Results Count */}
      <div className="flex items-center justify-between text-xs text-neutral-500 px-1">
        <span>
          Showing <span className="font-mono tabular-nums font-semibold text-neutral-900">{filteredEmployees.length}</span> of{' '}
          <span className="font-mono tabular-nums font-semibold text-neutral-900">{employees.length}</span> employees
        </span>
        {activeSearch && (
          <button
            onClick={() => setSearch('')}
            className="text-neutral-700 hover:underline cursor-pointer"
          >
            Clear search filters
          </button>
        )}
      </div>

      {/* Empty State */}
      {filteredEmployees.length === 0 && (
        <div className="bg-white rounded-xl border border-neutral-200 p-12 text-center">
          <p className="text-sm font-semibold text-neutral-800">No personnel records matched your filter criteria.</p>
          <p className="text-xs text-neutral-500 mt-1">Try resetting the department filter or search query.</p>
          <button
            onClick={() => {
              setSearch('');
              setSelectedDept('all');
              setSelectedStatus('all');
              setSelectedWorkMode('all');
            }}
            className="mt-4 px-4 py-2 text-xs font-medium text-white bg-neutral-900 rounded-lg hover:bg-neutral-800 transition-colors cursor-pointer"
          >
            Reset Filters
          </button>
        </div>
      )}

      {/* TABLE VIEW */}
      {viewMode === 'table' && filteredEmployees.length > 0 && (
        <div className="bg-white rounded-xl border border-neutral-200/80 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-neutral-200 bg-neutral-50/75 text-neutral-500 uppercase tracking-wider font-semibold">
                  <th className="py-3 px-4">Employee</th>
                  <th className="py-3 px-4">ID</th>
                  <th className="py-3 px-4">Department</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Work Mode</th>
                  <th className="py-3 px-4">Location</th>
                  <th className="py-3 px-4">Privilege Tier</th>
                  <th className="py-3 px-4 text-right">Annual Gross</th>
                  <th className="py-3 px-4 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100">
                {filteredEmployees.map((emp) => (
                  <tr
                    key={emp.id}
                    onClick={() => setSelectedEmployee(emp)}
                    className="hover:bg-neutral-50/80 transition-colors cursor-pointer group"
                  >
                    {/* Name & Avatar */}
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <Avatar src={emp.avatarUrl} name={emp.name} size="sm" />
                        <div className="min-w-0">
                          <p className="font-semibold text-neutral-900 truncate group-hover:text-indigo-900">
                            {emp.name}
                          </p>
                          <p className="text-neutral-500 truncate text-xs">{emp.role}</p>
                        </div>
                      </div>
                    </td>

                    {/* ID */}
                    <td className="py-3 px-4 font-mono text-neutral-500 font-medium">{emp.employeeCode}</td>

                    {/* Department */}
                    <td className="py-3 px-4 text-neutral-700 font-medium">{emp.department}</td>

                    {/* Status */}
                    <td className="py-3 px-4">
                      <span className="capitalize font-medium text-neutral-700">
                        {emp.status.replace('_', ' ')}
                      </span>
                    </td>

                    {/* Work Mode */}
                    <td className="py-3 px-4 capitalize text-neutral-600">{emp.workMode}</td>

                    {/* Location */}
                    <td className="py-3 px-4 text-neutral-600">{emp.location}</td>

                    {/* Privilege Tier */}
                    <td className="py-3 px-4">
                      <span className={`inline-block px-2 py-0.5 rounded text-2xs font-bold uppercase tracking-wider border ${
                        roleMeta[emp.privilegeRole || 'employee']?.style || 'bg-neutral-100 text-neutral-700'
                      }`}>
                        {roleMeta[emp.privilegeRole || 'employee']?.label || 'Employee'}
                      </span>
                    </td>

                    {/* Salary (Tabular - Permission Protected) */}
                    <td className="py-3 px-4 text-right font-mono tabular-nums font-semibold text-neutral-900">
                      {permissions.canViewAllSalaries || emp.id === activeUser.id ? (
                        formatMoney(emp.salary)
                      ) : (
                        <span className="text-neutral-400 font-sans text-xs italic font-normal inline-flex items-center gap-1">
                          <Lock className="w-3 h-3 text-neutral-400" />
                          <span>Confidential</span>
                        </span>
                      )}
                    </td>

                    {/* Action Arrow */}
                    <td className="py-3 px-4 text-center text-neutral-400 group-hover:text-neutral-900">
                      <ChevronRight className="w-4 h-4 mx-auto" />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* GRID VIEW */}
      {viewMode === 'grid' && filteredEmployees.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredEmployees.map((emp) => (
            <div
              key={emp.id}
              onClick={() => setSelectedEmployee(emp)}
              className="bg-white p-5 rounded-xl border border-neutral-200/80 hover:border-neutral-300 shadow-xs hover:shadow-sm transition-all cursor-pointer flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <Avatar src={emp.avatarUrl} name={emp.name} size="md" />
                    <div>
                      <h4 className="font-bold text-neutral-900 text-xs tracking-tight">{emp.name}</h4>
                      <p className="text-neutral-500 text-xs">{emp.role}</p>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <span className="text-xs font-mono text-neutral-400 font-medium">{emp.employeeCode}</span>
                    <span className={`text-2xs px-1.5 py-0.2 rounded font-bold uppercase tracking-wider border ${
                      roleMeta[emp.privilegeRole || 'employee']?.style || 'bg-neutral-100 text-neutral-700'
                    }`}>
                      {roleMeta[emp.privilegeRole || 'employee']?.label || 'Employee'}
                    </span>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-neutral-100 space-y-1.5 text-xs text-neutral-600">
                  <div className="flex items-center justify-between">
                    <span className="text-neutral-400">Department</span>
                    <span className="font-medium text-neutral-900">{emp.department}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-neutral-400">Work Mode</span>
                    <span className="capitalize text-neutral-900">{emp.workMode}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-neutral-400">Status</span>
                    <span className="capitalize text-neutral-900">{emp.status.replace('_', ' ')}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-neutral-400">PTO Left</span>
                    <span className="font-mono tabular-nums font-semibold text-neutral-900">
                      {emp.leaveBalances.annualTotal - emp.leaveBalances.annualUsed} days
                    </span>
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-neutral-100 flex items-center justify-between text-xs">
                <span className="text-neutral-400">Annual Gross:</span>
                <span className="font-mono font-bold text-neutral-900 tabular-nums">
                  {permissions.canViewAllSalaries || emp.id === activeUser.id ? (
                    formatMoney(emp.salary)
                  ) : (
                    <span className="text-neutral-400 font-sans font-normal italic">Confidential</span>
                  )}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Selected Employee Detail Drawer */}
      <EmployeeDrawer
        employee={selectedEmployee}
        onClose={() => setSelectedEmployee(null)}
      />
    </div>
  );
};
