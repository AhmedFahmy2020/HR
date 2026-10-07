import React, { useState } from 'react';
import { useHR } from '../../context/HRContext';
import { JobPosting, JobApplicant, ApplicantStage, Department, WorkMode, EmploymentType } from '../../types/hr';
import { Avatar } from '../common/Avatar';
import {
  Briefcase,
  Plus,
  Star,
  Users,
  ChevronRight,
  MapPin,
  Calendar,
  ExternalLink,
  X,
  Check,
  Building,
  ShieldCheck
} from 'lucide-react';

const STAGES: Array<{ id: ApplicantStage; label: string }> = [
  { id: 'applied', label: 'Applied' },
  { id: 'screening', label: 'Screening' },
  { id: 'interview', label: 'Interview' },
  { id: 'offer', label: 'Offer' },
  { id: 'hired', label: 'Hired' },
];

export const RecruitmentATS: React.FC = () => {
  const {
    jobPostings,
    jobApplicants,
    addJobPosting,
    updateJobStatus,
    addApplicant,
    updateApplicantStage,
    updateApplicantRating,
    permissions,
    currentRole,
    activeUser,
  } = useHR();

  const [activeJobId, setActiveJobId] = useState<string>('all');
  const [selectedApplicant, setSelectedApplicant] = useState<JobApplicant | null>(null);
  const [isJobModalOpen, setIsJobModalOpen] = useState(false);
  const [isApplicantModalOpen, setIsApplicantModalOpen] = useState(false);
  const [referSuccess, setReferSuccess] = useState<string | null>(null);

  // New Job Form State
  const [jobForm, setJobForm] = useState({
    title: '',
    department: 'Engineering' as Department,
    location: 'Remote (US)',
    workMode: 'remote' as WorkMode,
    type: 'full_time' as EmploymentType,
    salaryRange: 'AED 140,000 - 165,000',
    description: '',
    requirements: '',
  });

  // Filter applicants by job
  const filteredApplicants = jobApplicants.filter((app) => {
    return activeJobId === 'all' || app.jobId === activeJobId;
  });

  const handleCreateJob = (e: React.FormEvent) => {
    e.preventDefault();
    if (!jobForm.title.trim()) return;

    addJobPosting({
      title: jobForm.title.trim(),
      department: jobForm.department,
      location: jobForm.location.trim(),
      workMode: jobForm.workMode,
      type: jobForm.type,
      salaryRange: jobForm.salaryRange.trim(),
      status: 'open',
      description: jobForm.description.trim() || 'Exciting opportunity at ISOFT HR.',
      requirements: jobForm.requirements
        .split('\n')
        .map((r) => r.trim())
        .filter(Boolean),
    });

    setIsJobModalOpen(false);
    setJobForm({
      title: '',
      department: 'Engineering',
      location: 'Remote (US)',
      workMode: 'remote',
      type: 'full_time',
      salaryRange: 'AED 140,000 - 165,000',
      description: '',
      requirements: '',
    });
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Active Privilege Banner */}
      <div className="bg-neutral-50/80 border border-neutral-200/90 rounded-xl px-4 py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-neutral-700" />
          <span className="font-semibold text-neutral-900">
            Recruitment Privilege: <span className="capitalize">{currentRole}</span>
          </span>
          <span className="text-neutral-500 hidden md:inline">
            {currentRole === 'employee'
              ? '· Browse active vacancies, internal transfers & submit colleague referrals'
              : currentRole === 'leader'
              ? '· Team lead review: Evaluate candidates, score interviews & advance department applicants'
              : currentRole === 'cto'
              ? '· Technical hiring lead: Engineering talent requisitions & candidate offer sign-offs'
              : '· Global talent acquisition: Full ATS pipeline management & job vacancy publication'}
          </span>
        </div>
        <span className="text-2xs font-mono text-neutral-500 bg-white px-2 py-0.5 rounded border border-neutral-200 self-start sm:self-auto">
          {permissions.canManageRecruitment ? 'Pipeline Management Active' : 'Internal Job Board Mode'}
        </span>
      </div>

      {/* Top Banner & Job Postings Row */}
      <div className="bg-white p-5 rounded-xl border border-neutral-200/80 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-base font-bold text-neutral-900 tracking-tight">
              {permissions.canManageRecruitment ? 'Talent Acquisition & Open Requisitions' : 'Internal Job Board & Career Growth'}
            </h3>
            <p className="text-xs text-neutral-500 mt-0.5">
              {permissions.canManageRecruitment
                ? 'Manage hiring pipelines, interview stages, and candidate offers'
                : 'Browse internal opportunities, career transfers, and refer colleagues'}
            </p>
          </div>
          {permissions.canManageRecruitment && (
            <button
              onClick={() => setIsJobModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-neutral-900 hover:bg-neutral-800 rounded-lg transition-colors cursor-pointer shadow-xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Post New Requisition</span>
            </button>
          )}
        </div>

        {/* Job Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div
            onClick={() => setActiveJobId('all')}
            className={`p-3.5 rounded-lg border transition-all cursor-pointer text-xs ${
              activeJobId === 'all'
                ? 'bg-neutral-900 text-white border-neutral-900'
                : 'bg-neutral-50 hover:bg-neutral-100/70 border-neutral-200 text-neutral-700'
            }`}
          >
            <div className="flex justify-between items-start font-semibold">
              <span>All Requisitions</span>
              <span className="font-mono tabular-nums">{jobApplicants.length} Candidates</span>
            </div>
            <p className={`mt-1 text-xs ${activeJobId === 'all' ? 'text-neutral-400' : 'text-neutral-500'}`}>
              Aggregate view across {jobPostings.length} postings
            </p>
          </div>

          {jobPostings.map((job) => {
            const isSelected = activeJobId === job.id;
            return (
              <div
                key={job.id}
                onClick={() => setActiveJobId(job.id)}
                className={`p-3.5 rounded-lg border transition-all cursor-pointer text-xs flex flex-col justify-between ${
                  isSelected
                    ? 'bg-neutral-900 text-white border-neutral-900'
                    : 'bg-neutral-50 hover:bg-neutral-100/70 border-neutral-200 text-neutral-800'
                }`}
              >
                <div>
                  <div className="flex justify-between items-start">
                    <span className="font-bold truncate pr-2">{job.title}</span>
                    <span
                      className={`text-xs font-medium capitalize ${
                        job.status === 'open' ? 'text-emerald-500' : 'text-neutral-400'
                      }`}
                    >
                      {job.status}
                    </span>
                  </div>
                  <div
                    className={`flex items-center gap-1.5 text-xs mt-1 ${
                      isSelected ? 'text-neutral-400' : 'text-neutral-500'
                    }`}
                  >
                    <span>{job.department}</span>
                    <span>·</span>
                    <span>{job.location}</span>
                  </div>
                </div>

                <div
                  className={`mt-2.5 pt-2 border-t flex justify-between font-mono tabular-nums text-xs ${
                    isSelected ? 'border-neutral-800 text-neutral-300' : 'border-neutral-200 text-neutral-600'
                  }`}
                >
                  <span>{job.salaryRange}</span>
                  <span>{job.applicantsCount} applicants</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Internal Career Board for Employees OR Kanban Pipeline Columns for Recruiters/Leaders */}
      {!permissions.canManageRecruitment ? (
        <div className="bg-white p-6 rounded-xl border border-neutral-200/80 space-y-4">
          <div>
            <h4 className="font-bold text-neutral-900 text-sm">Internal Mobility & Department Openings</h4>
            <p className="text-xs text-neutral-500 mt-0.5">
              Explore opportunities to grow your career within ISOFT HR or refer trusted peers from your network.
            </p>
          </div>

          {referSuccess && (
            <div className="p-3 bg-emerald-50 text-emerald-800 rounded-lg text-xs font-medium border border-emerald-200">
              {referSuccess}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
            {jobPostings.filter((j) => j.status === 'open').map((job) => (
              <div key={job.id} className="p-4 bg-neutral-50 rounded-xl border border-neutral-200/80 space-y-3 flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="font-bold text-neutral-900 text-xs">{job.title}</span>
                      <p className="text-neutral-500 text-xs mt-0.5">{job.department} · {job.location}</p>
                    </div>
                    <span className="font-mono text-neutral-700 text-xs font-semibold">{job.salaryRange}</span>
                  </div>

                  <p className="text-neutral-600 text-xs mt-2 leading-relaxed">{job.description}</p>

                  <div className="mt-3">
                    <span className="text-2xs uppercase tracking-wider font-semibold text-neutral-400 block mb-1">
                      Key Qualifications
                    </span>
                    <ul className="text-xs text-neutral-600 space-y-1">
                      {job.requirements.slice(0, 3).map((r, i) => (
                        <li key={i} className="flex items-center gap-1.5">
                          <span className="text-neutral-400">·</span>
                          <span>{r}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="pt-3 border-t border-neutral-200 flex justify-between items-center text-xs">
                  <span className="text-neutral-400 font-mono">Posted: {job.postedDate}</span>
                  <button
                    onClick={() => {
                      setReferSuccess(`Referral application initiated for ${job.title}! An internal candidate interest ticket has been routed to HR.`);
                      setTimeout(() => setReferSuccess(null), 4000);
                    }}
                    className="px-3 py-1.5 bg-neutral-900 text-white rounded-lg font-semibold hover:bg-neutral-800 transition-colors cursor-pointer shadow-xs"
                  >
                    Refer / Express Interest
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 overflow-x-auto min-w-[900px] pb-4">
        {STAGES.map((col) => {
          const stageApps = filteredApplicants.filter((a) => a.stage === col.id);

          return (
            <div key={col.id} className="bg-neutral-100/60 rounded-xl p-3 border border-neutral-200/80 flex flex-col">
              {/* Column Header */}
              <div className="flex items-center justify-between px-1 pb-3">
                <span className="text-xs font-bold text-neutral-800 tracking-tight">{col.label}</span>
                <span className="text-xs font-mono font-semibold text-neutral-500 bg-white px-2 py-0.5 rounded-md border border-neutral-200/80 shadow-2xs">
                  {stageApps.length}
                </span>
              </div>

              {/* Cards list */}
              <div className="space-y-2.5 flex-1 min-h-64">
                {stageApps.length === 0 ? (
                  <div className="h-32 rounded-lg border border-dashed border-neutral-300/80 flex items-center justify-center text-neutral-400 text-xs text-center p-2">
                    No candidates
                  </div>
                ) : (
                  stageApps.map((app) => (
                    <div
                      key={app.id}
                      onClick={() => setSelectedApplicant(app)}
                      className="bg-white p-3.5 rounded-lg border border-neutral-200 shadow-2xs hover:shadow-xs hover:border-neutral-300 transition-all cursor-pointer text-xs space-y-2"
                    >
                      <div className="flex items-start justify-between">
                        <span className="font-bold text-neutral-900">{app.name}</span>
                        <div className="flex items-center gap-0.5 text-amber-500">
                          <Star className="w-3 h-3 fill-current" />
                          <span className="font-mono text-neutral-700 text-xs font-medium">{app.rating}</span>
                        </div>
                      </div>

                      <p className="text-neutral-500 text-xs truncate">{app.jobTitle}</p>

                      <div className="text-neutral-400 text-xs flex items-center justify-between pt-2 border-t border-neutral-100">
                        <span>{app.experienceYears} yrs exp</span>
                        <span className="font-mono">{app.appliedDate.slice(5)}</span>
                      </div>

                      {/* Stage Movement Controls */}
                      <div className="pt-1 flex items-center justify-between gap-1">
                        <select
                          value={app.stage}
                          onClick={(e) => e.stopPropagation()}
                          onChange={(e) => updateApplicantStage(app.id, e.target.value as ApplicantStage)}
                          className="w-full text-xs py-1 px-1.5 bg-neutral-50 border border-neutral-200 rounded font-medium text-neutral-700 cursor-pointer"
                        >
                          <option value="applied">Applied</option>
                          <option value="screening">Screening</option>
                          <option value="interview">Interview</option>
                          <option value="offer">Offer</option>
                          <option value="hired">Hired</option>
                          <option value="rejected">Rejected</option>
                        </select>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>
      )}

      {/* Candidate Detail Modal */}
      {selectedApplicant && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-xl shadow-2xl border border-neutral-200 w-full max-w-lg overflow-hidden flex flex-col">
            <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-200 bg-neutral-50/50">
              <div>
                <h3 className="text-base font-bold text-neutral-900">{selectedApplicant.name}</h3>
                <p className="text-xs text-neutral-500">{selectedApplicant.jobTitle}</p>
              </div>
              <button
                onClick={() => setSelectedApplicant(null)}
                className="p-1.5 text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 rounded-lg cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3 p-3 bg-neutral-50 rounded-lg border border-neutral-200">
                <div>
                  <span className="text-neutral-500 block">Email Address</span>
                  <span className="font-semibold text-neutral-900">{selectedApplicant.email}</span>
                </div>
                <div>
                  <span className="text-neutral-500 block">Phone</span>
                  <span className="font-mono text-neutral-900 font-semibold">{selectedApplicant.phone}</span>
                </div>
                <div>
                  <span className="text-neutral-500 block">Experience</span>
                  <span className="font-semibold text-neutral-900">{selectedApplicant.experienceYears} Years</span>
                </div>
                <div>
                  <span className="text-neutral-500 block">Applied Date</span>
                  <span className="font-mono text-neutral-900 font-semibold">{selectedApplicant.appliedDate}</span>
                </div>
              </div>

              {selectedApplicant.portfolioUrl && (
                <div className="flex items-center gap-2">
                  <span className="text-neutral-500">Portfolio / Work:</span>
                  <a
                    href={selectedApplicant.portfolioUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="text-neutral-900 font-medium underline flex items-center gap-1"
                  >
                    {selectedApplicant.portfolioUrl}
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              )}

              <div>
                <span className="text-neutral-500 block font-semibold mb-1">Interview Assessment & Notes</span>
                <p className="p-3 bg-neutral-50 rounded-lg border border-neutral-200 text-neutral-700 leading-relaxed">
                  {selectedApplicant.notes || 'No assessment notes recorded yet.'}
                </p>
              </div>

              {/* Rating and Stage Update */}
              <div className="grid grid-cols-2 gap-4 pt-2 border-t border-neutral-200">
                <div>
                  <label className="block text-neutral-700 font-semibold mb-1">Candidate Rating</label>
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => updateApplicantRating(selectedApplicant.id, star)}
                        className="cursor-pointer"
                      >
                        <Star
                          className={`w-5 h-5 ${
                            star <= selectedApplicant.rating
                              ? 'text-amber-500 fill-amber-500'
                              : 'text-neutral-300'
                          }`}
                        />
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-neutral-700 font-semibold mb-1">Pipeline Stage</label>
                  <select
                    value={selectedApplicant.stage}
                    onChange={(e) => {
                      const newStage = e.target.value as ApplicantStage;
                      updateApplicantStage(selectedApplicant.id, newStage);
                      setSelectedApplicant({ ...selectedApplicant, stage: newStage });
                    }}
                    className="w-full px-3 py-1.5 bg-neutral-50 border border-neutral-200 rounded-lg font-medium cursor-pointer"
                  >
                    <option value="applied">Applied</option>
                    <option value="screening">Screening</option>
                    <option value="interview">Interview</option>
                    <option value="offer">Offer</option>
                    <option value="hired">Hired</option>
                    <option value="rejected">Rejected</option>
                  </select>
                </div>
              </div>

              <div className="pt-3 flex justify-end">
                <button
                  onClick={() => setSelectedApplicant(null)}
                  className="px-4 py-2 text-white bg-neutral-900 rounded-lg font-semibold cursor-pointer shadow-xs"
                >
                  Done
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Create Job Modal */}
      {isJobModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-xl shadow-2xl border border-neutral-200 w-full max-w-lg overflow-hidden flex flex-col">
            <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-200 bg-neutral-50/50">
              <h3 className="text-base font-bold text-neutral-900">Post New Requisition</h3>
              <button
                onClick={() => setIsJobModalOpen(false)}
                className="p-1.5 text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 rounded-lg cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateJob} className="p-6 space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-neutral-700 mb-1">Role Title *</label>
                <input
                  type="text"
                  placeholder="e.g. Senior Security Engineer"
                  value={jobForm.title}
                  onChange={(e) => setJobForm({ ...jobForm, title: e.target.value })}
                  className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-lg"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-neutral-700 mb-1">Department</label>
                  <select
                    value={jobForm.department}
                    onChange={(e) => setJobForm({ ...jobForm, department: e.target.value as Department })}
                    className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-lg"
                  >
                    <option value="Engineering">Engineering</option>
                    <option value="Product & Design">Product & Design</option>
                    <option value="People & HR">People & HR</option>
                    <option value="Marketing">Marketing</option>
                    <option value="Sales">Sales</option>
                    <option value="Finance & Operations">Finance & Ops</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-neutral-700 mb-1">Salary Range</label>
                  <input
                    type="text"
                    placeholder="AED 130,000 - 160,000"
                    value={jobForm.salaryRange}
                    onChange={(e) => setJobForm({ ...jobForm, salaryRange: e.target.value })}
                    className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-lg font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-neutral-700 mb-1">Location</label>
                  <input
                    type="text"
                    value={jobForm.location}
                    onChange={(e) => setJobForm({ ...jobForm, location: e.target.value })}
                    className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-neutral-700 mb-1">Work Mode</label>
                  <select
                    value={jobForm.workMode}
                    onChange={(e) => setJobForm({ ...jobForm, workMode: e.target.value as WorkMode })}
                    className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-lg"
                  >
                    <option value="remote">Remote</option>
                    <option value="hybrid">Hybrid</option>
                    <option value="onsite">Onsite</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-neutral-700 mb-1">Job Description</label>
                <textarea
                  rows={2}
                  placeholder="Primary responsibilities and team mission..."
                  value={jobForm.description}
                  onChange={(e) => setJobForm({ ...jobForm, description: e.target.value })}
                  className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-lg"
                />
              </div>

              <div>
                <label className="block font-semibold text-neutral-700 mb-1">Requirements (1 per line)</label>
                <textarea
                  rows={3}
                  placeholder="5+ years experience in distributed systems&#10;Proficiency in TypeScript and Go"
                  value={jobForm.requirements}
                  onChange={(e) => setJobForm({ ...jobForm, requirements: e.target.value })}
                  className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-lg"
                />
              </div>

              <div className="pt-3 flex justify-end gap-2 border-t border-neutral-200">
                <button
                  type="button"
                  onClick={() => setIsJobModalOpen(false)}
                  className="px-3.5 py-2 text-neutral-600 bg-neutral-100 hover:bg-neutral-200 rounded-lg font-medium cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-white bg-neutral-900 hover:bg-neutral-800 rounded-lg font-semibold cursor-pointer shadow-xs"
                >
                  Publish Requisition
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
