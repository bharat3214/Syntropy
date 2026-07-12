"use client";

import React, { useState, useMemo } from "react";

export type AuditStatus = "Completed" | "Under Review" | "Scheduled";
export type Severity = "High" | "Medium" | "Low";
export type ComplianceStatus = "Open" | "Resolved" | "In Progress";

export interface ComplianceIssue {
  id: string;
  auditId: string;
  issue: string;
  severity: Severity;
  department: string;
  status: ComplianceStatus;
}

export interface Audit {
  id: string;
  title: string;
  department: string;
  auditor: string;
  date: string;
  findings: string;
  status: AuditStatus;
}

export interface AuditWithIssues extends Audit {
  complianceIssues: ComplianceIssue[];
}

export interface CreateAuditForm {
  title: string;
  department: string;
  auditor: string;
  date: string;
  findings: string;
  status: AuditStatus;
}

interface AuditsSectionProps {
  audits: AuditWithIssues[];
  auditForm: CreateAuditForm;
  setAuditForm: React.Dispatch<React.SetStateAction<CreateAuditForm>>;
  onCreateAudit: (event: React.FormEvent<HTMLFormElement>) => Promise<void>;
  onExportAudits: () => Promise<void>;
}

// Hand-drawn custom SVG Icons matching spec: 2px stroke, outline style, rounded joins and caps.
const SearchIcon = () => (
  <svg className="w-4 h-4 text-[#9CA3AF]" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
    <circle cx="11" cy="11" r="8"></circle>
    <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
  </svg>
);

const PlusIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
    <line x1="12" y1="5" x2="12" y2="19"></line>
    <line x1="5" y1="12" x2="19" y2="12"></line>
  </svg>
);

const DownloadIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
    <polyline points="7 10 12 15 17 10"></polyline>
    <line x1="12" y1="15" x2="12" y2="3"></line>
  </svg>
);

const XIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
    <line x1="18" y1="6" x2="6" y2="18"></line>
    <line x1="6" y1="6" x2="18" y2="18"></line>
  </svg>
);

const CalendarIcon = () => (
  <svg className="w-4 h-4 text-[#9CA3AF]" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
    <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
    <line x1="16" y1="2" x2="16" y2="6"></line>
    <line x1="8" y1="2" x2="8" y2="6"></line>
    <line x1="3" y1="10" x2="21" y2="10"></line>
  </svg>
);

const UserIcon = () => (
  <svg className="w-4 h-4 text-[#9CA3AF]" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
    <circle cx="12" cy="7" r="4"></circle>
  </svg>
);

const AlertTriangleIcon = () => (
  <svg className="w-4 h-4 text-[#EF4444]" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
    <line x1="12" y1="9" x2="12" y2="13"></line>
    <line x1="12" y1="17" x2="12.01" y2="17"></line>
  </svg>
);

export default function AuditsSection({
  audits,
  auditForm,
  setAuditForm,
  onCreateAudit,
  onExportAudits,
}: AuditsSectionProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    await onCreateAudit(e);
    setIsModalOpen(false);
  };

  // Get initials for avatar icon
  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const filteredAudits = useMemo(() => {
    return audits.filter((audit) => {
      const matchesSearch =
        audit.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        audit.department.toLowerCase().includes(searchQuery.toLowerCase()) ||
        audit.auditor.toLowerCase().includes(searchQuery.toLowerCase()) ||
        audit.findings.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = statusFilter === "all" || audit.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [audits, searchQuery, statusFilter]);

  return (
    <div className="space-y-6">
      {/* Header and CTAs */}
      <div className="flex flex-col sm:flex-row gap-4 items-stretch sm:items-center justify-between">
        {/* Search */}
        <div className="relative w-full sm:w-80">
          <span className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
            <SearchIcon />
          </span>
          <input
            type="text"
            placeholder="Search audit logs..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-[#111815] border border-[#232B27] rounded-xl text-sm text-[#F3F4F1] placeholder-[#9CA3AF]/60 focus:outline-none focus:ring-1 focus:ring-[#22C55E] focus:border-[#22C55E] transition-all"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 bg-[#111815] border border-[#232B27] rounded-xl text-sm text-[#F3F4F1] focus:outline-none focus:ring-1 focus:ring-[#22C55E] focus:border-[#22C55E]"
          >
            <option value="all">All Statuses</option>
            <option value="Completed">Completed</option>
            <option value="Under Review">Under Review</option>
            <option value="Scheduled">Scheduled</option>
          </select>

          <button
            type="button"
            onClick={onExportAudits}
            className="px-4 py-2 bg-transparent border border-[#22C55E] text-[#22C55E] hover:bg-[#0F1512] font-semibold text-sm rounded-xl transition-all flex items-center gap-2"
          >
            <DownloadIcon />
            <span>Export (CSV)</span>
          </button>

          <button
            type="button"
            onClick={() => setIsModalOpen(true)}
            className="px-4 py-2 bg-[#22C55E] text-[#0B0F0D] hover:bg-[#22C55E]/90 font-semibold text-sm rounded-xl transition-all flex items-center gap-2"
          >
            <PlusIcon />
            <span>New Audit</span>
          </button>
        </div>
      </div>

      {/* Grid of Audit Cards */}
      {filteredAudits.length === 0 ? (
        <div className="text-center py-16 bg-[#111815] border border-[#232B27] rounded-2xl text-[#9CA3AF]">
          No audit records found matching the criteria.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredAudits.map((audit) => {
            const issuesCount = audit.complianceIssues?.length || 0;
            return (
              <div
                key={audit.id}
                className="bg-[#111815] border border-[#232B27] rounded-2xl p-6 shadow-lg shadow-black/40 flex flex-col justify-between hover:border-[#22C55E]/30 transition-all group"
              >
                <div className="space-y-4">
                  {/* Top line: Dept & Status */}
                  <div className="flex items-center justify-between">
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#0F1512] border border-[#232B27] text-[#9CA3AF]">
                      {audit.department}
                    </span>
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${
                        audit.status === "Completed"
                          ? "bg-[#22C55E]/10 border-[#22C55E]/20 text-[#22C55E]"
                          : audit.status === "Under Review"
                          ? "bg-[#F59E0B]/10 border-[#F59E0B]/20 text-[#F59E0B]"
                          : "bg-[#3B82F6]/10 border-[#3B82F6]/20 text-[#3B82F6]"
                      }`}
                    >
                      {audit.status}
                    </span>
                  </div>

                  {/* Title & Findings */}
                  <div className="space-y-2">
                    <h3 className="text-lg font-semibold text-[#F3F4F1] group-hover:text-[#4ADE80] transition-colors line-clamp-1">
                      {audit.title}
                    </h3>
                    <p className="text-sm text-[#9CA3AF] line-clamp-2 h-10">
                      {audit.findings}
                    </p>
                  </div>
                </div>

                {/* Footer line: Auditor & Issues */}
                <div className="mt-6 pt-4 border-t border-[#232B27] flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-[#0F1512] border border-[#232B27] flex items-center justify-center text-xs font-semibold text-[#22C55E]">
                      {getInitials(audit.auditor)}
                    </div>
                    <div className="text-left">
                      <p className="text-xs font-medium text-[#F3F4F1]">
                        {audit.auditor}
                      </p>
                      <p className="text-[10px] text-[#9CA3AF] flex items-center gap-1">
                        <CalendarIcon />
                        {audit.date}
                      </p>
                    </div>
                  </div>

                  {/* Issues Trigger Count */}
                  <div>
                    {issuesCount > 0 ? (
                      <span className="flex items-center gap-1 text-xs font-medium text-[#EF4444] bg-[#EF4444]/10 px-2.5 py-1 rounded-lg border border-[#EF4444]/20">
                        <AlertTriangleIcon />
                        <span>{issuesCount} Issue{issuesCount > 1 ? "s" : ""}</span>
                      </span>
                    ) : (
                      <span className="text-xs font-medium text-[#9CA3AF] bg-[#0F1512] px-2.5 py-1 rounded-lg border border-[#232B27]">
                        No Issues
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Overlay Modal Form */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            onClick={() => setIsModalOpen(false)}
          />

          {/* Modal Container */}
          <div className="bg-[#111815] border border-[#232B27] rounded-2xl w-full max-w-lg p-6 md:p-8 shadow-2xl relative z-10 space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-[#4ADE80]">
                Record ESG Audit
              </h2>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="text-[#9CA3AF] hover:text-[#F3F4F1] transition-colors p-1"
              >
                <XIcon />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-[#9CA3AF] uppercase tracking-wider">
                    Audit Title
                  </label>
                  <input
                    required
                    type="text"
                    placeholder="e.g. Q3 Carbon Assessment"
                    value={auditForm.title}
                    onChange={(e) =>
                      setAuditForm((prev) => ({
                        ...prev,
                        title: e.target.value,
                      }))
                    }
                    className="w-full px-3 py-2 bg-[#0F1512] border border-[#232B27] rounded-xl text-sm text-[#F3F4F1] focus:outline-none focus:ring-1 focus:ring-[#22C55E] focus:border-[#22C55E]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-[#9CA3AF] uppercase tracking-wider">
                    Department
                  </label>
                  <input
                    required
                    type="text"
                    placeholder="e.g. Manufacturing"
                    value={auditForm.department}
                    onChange={(e) =>
                      setAuditForm((prev) => ({
                        ...prev,
                        department: e.target.value,
                      }))
                    }
                    className="w-full px-3 py-2 bg-[#0F1512] border border-[#232B27] rounded-xl text-sm text-[#F3F4F1] focus:outline-none focus:ring-1 focus:ring-[#22C55E] focus:border-[#22C55E]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-[#9CA3AF] uppercase tracking-wider">
                    Lead Auditor
                  </label>
                  <input
                    required
                    type="text"
                    placeholder="e.g. Jane Doe"
                    value={auditForm.auditor}
                    onChange={(e) =>
                      setAuditForm((prev) => ({
                        ...prev,
                        auditor: e.target.value,
                      }))
                    }
                    className="w-full px-3 py-2 bg-[#0F1512] border border-[#232B27] rounded-xl text-sm text-[#F3F4F1] focus:outline-none focus:ring-1 focus:ring-[#22C55E] focus:border-[#22C55E]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-[#9CA3AF] uppercase tracking-wider">
                    Audit Date
                  </label>
                  <input
                    required
                    type="date"
                    value={auditForm.date}
                    onChange={(e) =>
                      setAuditForm((prev) => ({
                        ...prev,
                        date: e.target.value,
                      }))
                    }
                    className="w-full px-3 py-2 bg-[#0F1512] border border-[#232B27] rounded-xl text-sm text-[#F3F4F1] focus:outline-none focus:ring-1 focus:ring-[#22C55E] focus:border-[#22C55E] [color-scheme:dark]"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-[#9CA3AF] uppercase tracking-wider">
                  Status
                </label>
                <select
                  value={auditForm.status}
                  onChange={(e) =>
                    setAuditForm((prev) => ({
                      ...prev,
                      status: e.target.value as AuditStatus,
                    }))
                  }
                  className="w-full px-3 py-2 bg-[#0F1512] border border-[#232B27] rounded-xl text-sm text-[#F3F4F1] focus:outline-none focus:ring-1 focus:ring-[#22C55E] focus:border-[#22C55E]"
                >
                  <option value="Scheduled">Scheduled</option>
                  <option value="Under Review">Under Review</option>
                  <option value="Completed">Completed</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-[#9CA3AF] uppercase tracking-wider">
                  Audit Findings Summary
                </label>
                <textarea
                  required
                  rows={3}
                  placeholder="Record summary observations, issues detected, or general results..."
                  value={auditForm.findings}
                  onChange={(e) =>
                    setAuditForm((prev) => ({
                      ...prev,
                      findings: e.target.value,
                    }))
                  }
                  className="w-full px-3 py-2 bg-[#0F1512] border border-[#232B27] rounded-xl text-sm text-[#F3F4F1] focus:outline-none focus:ring-1 focus:ring-[#22C55E] focus:border-[#22C55E] resize-none"
                />
              </div>

              <div className="pt-4 flex items-center justify-end gap-3 border-t border-[#232B27]">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-transparent text-[#9CA3AF] hover:text-[#F3F4F1] font-semibold text-sm rounded-xl transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#22C55E] text-[#0B0F0D] hover:bg-[#22C55E]/90 font-semibold text-sm rounded-xl transition-all"
                >
                  Create Record
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
