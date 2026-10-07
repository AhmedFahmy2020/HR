import React, { useState } from 'react';
import { useHR } from '../../context/HRContext';
import { PerformanceReview, KPIItem } from '../../types/hr';
import { Avatar } from '../common/Avatar';
import {
  Target,
  Award,
  CheckCircle2,
  TrendingUp,
  Plus,
  Star,
  Sliders,
  X,
  FileCheck,
  ShieldCheck
} from 'lucide-react';

export const PerformanceReviews: React.FC = () => {
  const { performanceReviews, updateGoalProgress, addPerformanceReview, employees, permissions, activeUser, currentRole } = useHR();
  const [selectedReviewId, setSelectedReviewId] = useState<string>(performanceReviews[0]?.id || '');
  const [isModalOpen, setIsModalOpen] = useState(false);

  // New review-cycle form state
  const [formEmpId, setFormEmpId] = useState('');
  const [formCycle, setFormCycle] = useState('Q4 2026 Growth Review');
  const [formScore, setFormScore] = useState('4.0');
  const [formSummary, setFormSummary] = useState('');
  const [formStrengths, setFormStrengths] = useState('');
  const [formGrowth, setFormGrowth] = useState('');

  // If user is employee, prioritize their own scorecard
  const employeeOwnReview = performanceReviews.find((r) => r.employeeId === activeUser.id);
  const fallbackReview: PerformanceReview = employeeOwnReview || {
    id: `rev-${activeUser.id}`,
    employeeId: activeUser.id,
    employeeName: activeUser.name,
    role: activeUser.role,
    department: activeUser.department,
    cycle: 'Q3 2026 Growth Review',
    score: 4.7,
    reviewerName: activeUser.managerName || 'Sarah Jenkins',
    reviewDate: '2026-09-30',
    summary: 'Consistently demonstrates strong ownership, timely task completion, and proactive communication across project deliverables.',
    strengths: ['Technical initiative', 'High reliability', 'Supportive cross-team collaboration'],
    growthAreas: ['Take more initiative in public engineering demos'],
    kpis: [
      { id: 'kpi-emp-1', title: 'Sprint backlog completion rate (>90%)', progress: 92, targetDate: '2026-10-31', status: 'on_track' },
      { id: 'kpi-emp-2', title: 'Code review turnaround under 24 hours', progress: 85, targetDate: '2026-11-15', status: 'on_track' },
    ],
  };

  const activeReview = !permissions.canManagePerformance
    ? fallbackReview
    : performanceReviews.find((r) => r.id === selectedReviewId) || performanceReviews[0];

  const handleCreateReview = (e: React.FormEvent) => {
    e.preventDefault();
    const emp = employees.find((e) => e.id === formEmpId);
    if (!emp) return;

    addPerformanceReview({
      employeeId: emp.id,
      employeeName: emp.name,
      role: emp.role,
      department: emp.department,
      cycle: formCycle,
      score: Number(formScore),
      reviewerName: 'Sarah Jenkins',
      summary: formSummary.trim() || 'Comprehensive quarterly contribution evaluation.',
      strengths: formStrengths.split(',').map((s) => s.trim()).filter(Boolean),
      growthAreas: formGrowth.split(',').map((s) => s.trim()).filter(Boolean),
      kpis: [
        { id: `kpi-${Date.now()}-1`, title: 'Core role execution & delivery', progress: 80, targetDate: '2026-11-30', status: 'on_track' },
        { id: `kpi-${Date.now()}-2`, title: 'Cross-functional collaboration feedback', progress: 90, targetDate: '2026-11-30', status: 'on_track' },
      ],
    });

    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Active Privilege Banner */}
      <div className="bg-neutral-50/80 border border-neutral-200/90 rounded-xl px-4 py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-neutral-700" />
          <span className="font-semibold text-neutral-900">
            Performance Privilege: <span className="capitalize">{currentRole}</span>
          </span>
          <span className="text-neutral-500 hidden md:inline">
            {currentRole === 'employee'
              ? '· Personal appraisal scorecard: Manager feedback, competencies & assigned objective tracking'
              : currentRole === 'leader'
              ? '· Team leadership view: Review direct reports, provide evaluations & calibrate KPI progress sliders'
              : currentRole === 'cto'
              ? '· Engineering leadership: Technical competence scorecards & department architecture goals'
              : '· Global performance management: Launch company review cycles & enterprise objective calibrations'}
          </span>
        </div>
        <span className="text-2xs font-mono text-neutral-500 bg-white px-2 py-0.5 rounded border border-neutral-200 self-start sm:self-auto">
          {permissions.canManagePerformance ? 'Manager Appraisal Active' : 'Self-Review Mode'}
        </span>
      </div>

      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-xl border border-neutral-200/80 shadow-xs">
        <div>
          <h3 className="text-base font-bold text-neutral-900 tracking-tight">
            {permissions.canManagePerformance ? 'Performance Reviews & Strategic Objectives' : 'My Performance & Growth Scorecard'}
          </h3>
          <p className="text-xs text-neutral-500 mt-0.5">
            {permissions.canManagePerformance
              ? 'Quarterly evaluation scorecards, competencies & real-time KPI progress tracking'
              : 'Review your manager feedback, assigned objectives, and professional development areas'}
          </p>
        </div>
        {permissions.canManagePerformance && (
          <button
            onClick={() => setIsModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-neutral-900 hover:bg-neutral-800 rounded-lg transition-colors cursor-pointer shadow-xs"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>New Review Cycle</span>
          </button>
        )}
      </div>

      {/* Main Grid: Reviews List (Managers only) & Active Scorecard */}
      <div className={`grid gap-6 ${permissions.canManagePerformance ? 'grid-cols-1 lg:grid-cols-3' : 'grid-cols-1'}`}>
        {/* Left List of Reviews (Shown only to managers/reviewers) */}
        {permissions.canManagePerformance && (
          <div className="space-y-3">
            <span className="text-xs font-semibold text-neutral-400 uppercase tracking-wider block px-1">
              Recorded Scorecards ({performanceReviews.length})
            </span>

            {performanceReviews.map((rev) => {
              const isSelected = activeReview?.id === rev.id;
              const emp = employees.find((e) => e.id === rev.employeeId);

              return (
                <div
                  key={rev.id}
                  onClick={() => setSelectedReviewId(rev.id)}
                  className={`p-4 rounded-xl border transition-all cursor-pointer text-xs ${
                    isSelected
                      ? 'bg-neutral-900 text-white border-neutral-900 shadow-xs'
                      : 'bg-white hover:bg-neutral-50 border-neutral-200 text-neutral-800'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <Avatar src={emp?.avatarUrl} name={rev.employeeName} size="sm" />
                      <div>
                        <span className="font-bold block text-sm">{rev.employeeName}</span>
                        <span className={`text-xs ${isSelected ? 'text-neutral-400' : 'text-neutral-500'}`}>
                          {rev.role}
                        </span>
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="flex items-center gap-1 text-amber-500 font-bold font-mono text-sm">
                        <Star className="w-3.5 h-3.5 fill-current" />
                        <span>{rev.score.toFixed(1)}</span>
                      </div>
                      <span className={`text-xs font-mono ${isSelected ? 'text-neutral-400' : 'text-neutral-400'}`}>
                        / 5.0
                      </span>
                    </div>
                  </div>

                  <div
                    className={`mt-3 pt-2 border-t flex justify-between text-xs ${
                      isSelected ? 'border-neutral-800 text-neutral-400' : 'border-neutral-100 text-neutral-500'
                    }`}
                  >
                    <span>{rev.cycle}</span>
                    <span className="font-mono">{rev.reviewDate}</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Right Active Scorecard Details (2 cols) */}
        {activeReview && (
          <div className="lg:col-span-2 bg-white rounded-xl border border-neutral-200/80 p-6 shadow-xs space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-neutral-100 gap-4">
              <div>
                <span className="text-xs font-semibold text-neutral-400 uppercase tracking-wider block font-mono">
                  {activeReview.cycle}
                </span>
                <h3 className="text-xl font-bold text-neutral-900 tracking-tight mt-0.5">
                  {activeReview.employeeName}
                </h3>
                <p className="text-xs text-neutral-500">
                  {activeReview.role} · {activeReview.department} · Evaluated by {activeReview.reviewerName}
                </p>
              </div>

              <div className="bg-neutral-50 border border-neutral-200/80 p-3 rounded-lg text-right min-w-32">
                <span className="text-xs text-neutral-500 block">Overall Rating</span>
                <div className="flex items-baseline justify-end gap-1 mt-0.5">
                  <span className="text-2xl font-bold font-mono tabular-nums text-neutral-950">
                    {activeReview.score.toFixed(1)}
                  </span>
                  <span className="text-xs text-neutral-400 font-mono">/ 5.0</span>
                </div>
              </div>
            </div>

            {/* Summary narrative */}
            <div>
              <h4 className="text-xs font-semibold uppercase tracking-wider text-neutral-400 mb-2">
                Executive Evaluation Summary
              </h4>
              <p className="p-4 bg-neutral-50 rounded-lg border border-neutral-200/80 text-xs text-neutral-700 leading-relaxed">
                "{activeReview.summary}"
              </p>
            </div>

            {/* Strengths & Growth Areas */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 bg-neutral-50 rounded-lg border border-neutral-200/80">
                <span className="font-semibold text-neutral-900 block text-xs mb-2">
                  Key Strengths & Impact
                </span>
                <ul className="space-y-1.5 text-xs text-neutral-600">
                  {activeReview.strengths.map((str, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="text-neutral-400">·</span>
                      <span>{str}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="p-4 bg-neutral-50 rounded-lg border border-neutral-200/80">
                <span className="font-semibold text-neutral-900 block text-xs mb-2">
                  Development & Focus Areas
                </span>
                <ul className="space-y-1.5 text-xs text-neutral-600">
                  {activeReview.growthAreas.map((area, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="text-neutral-400">·</span>
                      <span>{area}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Interactive KPI & Objectives Progress Trackers */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-xs font-semibold uppercase tracking-wider text-neutral-400">
                  Tracked Objectives & Deliverables
                </h4>
                <span className="text-xs text-neutral-500 font-mono">Drag sliders to update progress</span>
              </div>

              <div className="space-y-3">
                {activeReview.kpis.map((kpi) => (
                  <div
                    key={kpi.id}
                    className="p-4 bg-neutral-50 rounded-lg border border-neutral-200/80 space-y-2 text-xs"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-neutral-900">{kpi.title}</span>
                      <div className="flex items-center gap-2">
                        <span className="font-mono tabular-nums font-bold text-neutral-900">
                          {kpi.progress}%
                        </span>
                        <span
                          className={`font-semibold capitalize text-xs ${
                            kpi.status === 'completed'
                              ? 'text-emerald-700'
                              : kpi.status === 'at_risk'
                              ? 'text-rose-700'
                              : 'text-indigo-700'
                          }`}
                        >
                          ({kpi.status.replace('_', ' ')})
                        </span>
                      </div>
                    </div>

                    {/* Progress Slider */}
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={kpi.progress}
                      onChange={(e) =>
                        updateGoalProgress(activeReview.id, kpi.id, Number(e.target.value))
                      }
                      className="w-full accent-neutral-900 cursor-pointer h-1.5 bg-neutral-200 rounded-lg"
                    />

                    <div className="flex justify-between text-neutral-400 text-xs font-mono">
                      <span>Target Delivery: {kpi.targetDate}</span>
                      <span>0% → 100%</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* New Review Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-xl shadow-2xl border border-neutral-200 w-full max-w-lg overflow-hidden flex flex-col">
            <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-200 bg-neutral-50/50">
              <h3 className="text-base font-bold text-neutral-900">Log Performance Review</h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 rounded-lg cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateReview} className="p-6 space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-neutral-700 mb-1">Employee</label>
                <select
                  value={formEmpId}
                  onChange={(e) => setFormEmpId(e.target.value)}
                  className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-lg"
                >
                  {employees.map((e) => (
                    <option key={e.id} value={e.id}>
                      {e.name} — {e.role} ({e.department})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-neutral-700 mb-1">Review Cycle</label>
                  <input
                    type="text"
                    value={formCycle}
                    onChange={(e) => setFormCycle(e.target.value)}
                    className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-neutral-700 mb-1">Rating (1.0 to 5.0)</label>
                  <input
                    type="number"
                    step="0.1"
                    min="1"
                    max="5"
                    value={formScore}
                    onChange={(e) => setFormScore(e.target.value)}
                    className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-lg font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-neutral-700 mb-1">Executive Summary</label>
                <textarea
                  rows={2}
                  value={formSummary}
                  onChange={(e) => setFormSummary(e.target.value)}
                  className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-lg"
                  placeholder="Key accomplishments and impact..."
                  required
                />
              </div>

              <div>
                <label className="block font-semibold text-neutral-700 mb-1">Key Strengths (comma-separated)</label>
                <input
                  type="text"
                  value={formStrengths}
                  onChange={(e) => setFormStrengths(e.target.value)}
                  placeholder="Technical leadership, Architectural design, Mentorship"
                  className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-lg"
                />
              </div>

              <div>
                <label className="block font-semibold text-neutral-700 mb-1">Growth Areas (comma-separated)</label>
                <input
                  type="text"
                  value={formGrowth}
                  onChange={(e) => setFormGrowth(e.target.value)}
                  placeholder="Delegate earlier, Polish public documentation"
                  className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-lg"
                />
              </div>

              <div className="pt-3 flex justify-end gap-2 border-t border-neutral-200">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-3.5 py-2 text-neutral-600 bg-neutral-100 hover:bg-neutral-200 rounded-lg font-medium cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-white bg-neutral-900 hover:bg-neutral-800 rounded-lg font-semibold cursor-pointer shadow-xs"
                >
                  Save Scorecard
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
