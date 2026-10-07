import React, { useState } from 'react';
import { useHR } from '../../context/HRContext';
import { Avatar } from '../common/Avatar';
import { Employee, Announcement } from '../../types/hr';
import { EmployeeDrawer } from '../employees/EmployeeDrawer';
import {
  Building2,
  Plus,
  Trash2,
  AlertCircle,
  FileText,
  Users,
  ChevronDown,
  ChevronRight,
  Shield,
  X,
  ShieldCheck
} from 'lucide-react';

export const OrgAndCompany: React.FC = () => {
  const { employees, announcements, addAnnouncement, deleteAnnouncement, activeUser, currentRole, permissions } = useHR();
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [isAnnounceModalOpen, setIsAnnounceModalOpen] = useState(false);

  // New Announcement form state
  const [annTitle, setAnnTitle] = useState('');
  const [annContent, setAnnContent] = useState('');
  const [annPriority, setAnnPriority] = useState<'normal' | 'important' | 'urgent'>('normal');
  const [annDept, setAnnDept] = useState('All Company');

  const handlePostAnnouncement = (e: React.FormEvent) => {
    e.preventDefault();
    if (!annTitle.trim() || !annContent.trim()) return;

    addAnnouncement({
      title: annTitle.trim(),
      content: annContent.trim(),
      author: activeUser.name,
      authorRole: activeUser.role,
      priority: annPriority,
      department: annDept,
    });

    setAnnTitle('');
    setAnnContent('');
    setIsAnnounceModalOpen(false);
  };

  // Build hierarchy groups
  const executives = employees.filter(
    (e) => e.role.includes('Chief') || e.role.includes('COO') || e.role.includes('VP')
  );
  const leads = employees.filter(
    (e) => (e.role.includes('Lead') || e.role.includes('Staff') || e.role.includes('Principal')) && !executives.includes(e)
  );
  const teamMembers = employees.filter(
    (e) => !executives.includes(e) && !leads.includes(e)
  );

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-12">
      {/* Active Privilege Banner */}
      <div className="bg-neutral-50/80 border border-neutral-200/90 rounded-xl px-4 py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-neutral-700" />
          <span className="font-semibold text-neutral-900">
            Governance & Notice Privilege: <span className="capitalize">{currentRole}</span>
          </span>
          <span className="text-neutral-500 hidden md:inline">
            {currentRole === 'employee'
              ? '· Read-only access to company notices, organizational hierarchy, and team reports'
              : currentRole === 'leader'
              ? '· Team lead authority: Publish department memos and view team reporting lines'
              : currentRole === 'cto'
              ? '· Technical executive governance: Technical architecture memos and engineering hierarchy'
              : '· Enterprise governance: Publish company-wide bulletins, manage organizational hierarchy'}
          </span>
        </div>
        <span className="text-2xs font-mono text-neutral-500 bg-white px-2 py-0.5 rounded border border-neutral-200 self-start sm:self-auto">
          {permissions.canPostAnnouncements ? 'Publishing Enabled' : 'Read Only Mode'}
        </span>
      </div>

      {/* SECTION 1: Company Announcements */}
      <div className="bg-white rounded-xl border border-neutral-200/80 p-6 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-neutral-100">
          <div>
            <h3 className="text-base font-bold text-neutral-900 tracking-tight">
              Company Notices & Announcements
            </h3>
            <p className="text-xs text-neutral-500 mt-0.5">
              Official company-wide memos, policy revisions & town hall notices
            </p>
          </div>
          {permissions.canPostAnnouncements && (
            <button
              onClick={() => setIsAnnounceModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-neutral-900 hover:bg-neutral-800 rounded-lg transition-colors cursor-pointer shadow-xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Publish Notice</span>
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {announcements.map((ann) => (
            <div
              key={ann.id}
              className="p-4 bg-neutral-50 rounded-xl border border-neutral-200/80 flex flex-col justify-between text-xs"
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <span
                    className={`font-semibold uppercase tracking-wider text-xs ${
                      ann.priority === 'urgent'
                        ? 'text-rose-700'
                        : ann.priority === 'important'
                        ? 'text-amber-700'
                        : 'text-neutral-500'
                    }`}
                  >
                    {ann.priority} Notice · {ann.department}
                  </span>
                  {permissions.canDeleteAnnouncements && (
                    <button
                      onClick={() => deleteAnnouncement(ann.id)}
                      className="text-neutral-400 hover:text-rose-600 transition-colors cursor-pointer p-1"
                      title="Remove notice"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                <h4 className="font-bold text-neutral-900 text-sm leading-snug">{ann.title}</h4>
                <p className="text-neutral-600 mt-2 leading-relaxed text-xs">{ann.content}</p>
              </div>

              <div className="mt-4 pt-3 border-t border-neutral-200/60 flex items-center justify-between text-neutral-400 text-xs">
                <span>By {ann.author}</span>
                <span className="font-mono">{ann.date}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* SECTION 2: Organization Hierarchy Tree */}
      <div className="bg-white rounded-xl border border-neutral-200/80 p-6 shadow-xs space-y-6">
        <div>
          <h3 className="text-base font-bold text-neutral-900 tracking-tight">
            Organizational Structure & Reporting Hierarchy
          </h3>
          <p className="text-xs text-neutral-500 mt-0.5">
            Click on any personnel card to inspect profile, compensation history, and team scope
          </p>
        </div>

        {/* Hierarchy Tier 1: Executive Leadership */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <span className="text-xs font-semibold text-neutral-400 uppercase tracking-wider">
              Executive Leadership
            </span>
            <span className="h-px bg-neutral-200 flex-1" />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {executives.map((emp) => (
              <div
                key={emp.id}
                onClick={() => setSelectedEmployee(emp)}
                className="p-4 rounded-xl border border-neutral-200 hover:border-neutral-400 hover:shadow-xs bg-neutral-50/50 transition-all cursor-pointer flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <Avatar src={emp.avatarUrl} name={emp.name} size="md" />
                  <div>
                    <h4 className="font-bold text-neutral-900 text-xs">{emp.name}</h4>
                    <p className="text-xs text-neutral-500">{emp.role}</p>
                    <p className="text-xs text-neutral-400 mt-0.5">{emp.department} · {emp.location}</p>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-neutral-400" />
              </div>
            ))}
          </div>
        </div>

        {/* Hierarchy Tier 2: Leads & Architects */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <span className="text-xs font-semibold text-neutral-400 uppercase tracking-wider">
              Staff, Leads & Functional Heads
            </span>
            <span className="h-px bg-neutral-200 flex-1" />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {leads.map((emp) => (
              <div
                key={emp.id}
                onClick={() => setSelectedEmployee(emp)}
                className="p-4 rounded-xl border border-neutral-200 hover:border-neutral-400 hover:shadow-xs bg-neutral-50/50 transition-all cursor-pointer flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <Avatar src={emp.avatarUrl} name={emp.name} size="md" />
                  <div>
                    <h4 className="font-bold text-neutral-900 text-xs">{emp.name}</h4>
                    <p className="text-xs text-neutral-500">{emp.role}</p>
                    <p className="text-xs text-neutral-400 mt-0.5">
                      Reports to {emp.managerName} · {emp.department}
                    </p>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-neutral-400" />
              </div>
            ))}
          </div>
        </div>

        {/* Hierarchy Tier 3: Individual Contributors */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <span className="text-xs font-semibold text-neutral-400 uppercase tracking-wider">
              Engineering, Sales & People Operations
            </span>
            <span className="h-px bg-neutral-200 flex-1" />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {teamMembers.map((emp) => (
              <div
                key={emp.id}
                onClick={() => setSelectedEmployee(emp)}
                className="p-3.5 rounded-xl border border-neutral-200 hover:border-neutral-400 hover:shadow-xs bg-neutral-50/50 transition-all cursor-pointer flex items-center justify-between"
              >
                <div className="flex items-center gap-2.5">
                  <Avatar src={emp.avatarUrl} name={emp.name} size="sm" />
                  <div>
                    <h4 className="font-bold text-neutral-900 text-xs">{emp.name}</h4>
                    <p className="text-xs text-neutral-500 truncate">{emp.role}</p>
                    <p className="text-xs text-neutral-400">{emp.department}</p>
                  </div>
                </div>
                <ChevronRight className="w-3.5 h-3.5 text-neutral-400" />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* SECTION 3: Standard Corporate Policies & Handbooks */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-xl border border-neutral-200/80 shadow-xs">
          <div className="flex items-center gap-2 text-neutral-800 font-bold text-xs mb-2">
            <Shield className="w-4 h-4 text-indigo-600" />
            <span>Health & Benefits Policy</span>
          </div>
          <p className="text-neutral-500 text-xs leading-relaxed">
            100% employer-sponsored health, dental & vision plans. 401(k) retirement match at 5% with immediate vesting.
          </p>
        </div>

        <div className="bg-white p-5 rounded-xl border border-neutral-200/80 shadow-xs">
          <div className="flex items-center gap-2 text-neutral-800 font-bold text-xs mb-2">
            <FileText className="w-4 h-4 text-emerald-600" />
            <span>Flexible Time Off Guidelines</span>
          </div>
          <p className="text-neutral-500 text-xs leading-relaxed">
            20-25 days annual paid time off plus 12 statutory holidays and unlimited sick leave for recovery.
          </p>
        </div>

        <div className="bg-white p-5 rounded-xl border border-neutral-200/80 shadow-xs">
          <div className="flex items-center gap-2 text-neutral-800 font-bold text-xs mb-2">
            <Users className="w-4 h-4 text-violet-600" />
            <span>Remote & Hybrid Framework</span>
          </div>
          <p className="text-neutral-500 text-xs leading-relaxed">
            AED 1,000 annual home-office stipend for remote teammates. Flexible 2-day in-office collaboration for hybrid pods.
          </p>
        </div>
      </div>

      {/* Drawer */}
      <EmployeeDrawer
        employee={selectedEmployee}
        onClose={() => setSelectedEmployee(null)}
      />

      {/* New Announcement Modal */}
      {isAnnounceModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-xl shadow-2xl border border-neutral-200 w-full max-w-lg overflow-hidden flex flex-col">
            <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-200 bg-neutral-50/50">
              <h3 className="text-base font-bold text-neutral-900">Publish Company Announcement</h3>
              <button
                onClick={() => setIsAnnounceModalOpen(false)}
                className="p-1.5 text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 rounded-lg cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handlePostAnnouncement} className="p-6 space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-neutral-700 mb-1">Notice Headline</label>
                <input
                  type="text"
                  placeholder="e.g. Q4 Company All-Hands & Strategy Meeting"
                  value={annTitle}
                  onChange={(e) => setAnnTitle(e.target.value)}
                  className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-lg"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-neutral-700 mb-1">Priority</label>
                  <select
                    value={annPriority}
                    onChange={(e) => setAnnPriority(e.target.value as any)}
                    className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-lg"
                  >
                    <option value="normal">Normal Memo</option>
                    <option value="important">Important Notice</option>
                    <option value="urgent">Urgent Announcement</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-neutral-700 mb-1">Audience</label>
                  <input
                    type="text"
                    value={annDept}
                    onChange={(e) => setAnnDept(e.target.value)}
                    className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-lg"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-neutral-700 mb-1">Message Content</label>
                <textarea
                  rows={4}
                  placeholder="Detailed announcement, instructions, meeting links..."
                  value={annContent}
                  onChange={(e) => setAnnContent(e.target.value)}
                  className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-lg"
                  required
                />
              </div>

              <div className="pt-3 flex justify-end gap-2 border-t border-neutral-200">
                <button
                  type="button"
                  onClick={() => setIsAnnounceModalOpen(false)}
                  className="px-3.5 py-2 text-neutral-600 bg-neutral-100 hover:bg-neutral-200 rounded-lg font-medium cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-white bg-neutral-900 hover:bg-neutral-800 rounded-lg font-semibold cursor-pointer shadow-xs"
                >
                  Broadcast Notice
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
