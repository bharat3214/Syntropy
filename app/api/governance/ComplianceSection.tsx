"use client";

import React, { useState, useMemo } from "react";

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

interface ComplianceSectionProps {
  complianceIssues: ComplianceIssue[];
  onResolveIssue: (issueId: string) => void;
  isPending: boolean;
}

// Hand-drawn custom SVG Icons matching spec: 2px stroke, outline style, rounded joins and caps.
const SearchIcon = () => (
  <svg className="w-4 h-4 text-[#9CA3AF]" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
    <circle cx="11" cy="11" r="8"></circle>
    <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
  </svg>
);

const ShieldAlertIcon = (
  { className = "w-4 h-4" }: { className?: string } = {}
) => (
  <svg className={`${className} text-[#EF4444]`} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
    <line x1="12" y1="8" x2="12" y2="12"></line>
    <line x1="12" y1="16" x2="12.01" y2="16"></line>
  </svg>
);

const CheckIcon = () => (
  <svg className="w-4 h-4 text-[#22C55E]" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
    <polyline points="20 6 9 17 4 12"></polyline>
  </svg>
);

const ShieldCheckIcon = () => (
  <svg className="w-5 h-5 text-[#22C55E]" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
    <polyline points="9 11 11 13 15 9"></polyline>
  </svg>
);

const SpinnerIcon = () => (
  <svg className="animate-spin h-4 w-4 text-[#0B0F0D]" fill="none" viewBox="0 0 24 24">
    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
  </svg>
);

export default function ComplianceSection({
  complianceIssues,
  onResolveIssue,
  isPending,
}: ComplianceSectionProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [severityFilter, setSeverityFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [clickedIssueId, setClickedIssueId] = useState<string | null>(null);

  const handleResolveClick = (id: string) => {
    setClickedIssueId(id);
    onResolveIssue(id);
  };

  // Metrics calculation
  const metrics = useMemo(() => {
    const total = complianceIssues.length;
    const openCount = complianceIssues.filter((i) => i.status === "Open").length;
    const inProgressCount = complianceIssues.filter((i) => i.status === "In Progress").length;
    const resolvedCount = complianceIssues.filter((i) => i.status === "Resolved").length;

    return {
      total,
      unresolved: openCount + inProgressCount,
      resolved: resolvedCount,
    };
  }, [complianceIssues]);

  // Filtering logic
  const filteredIssues = useMemo(() => {
    return complianceIssues.filter((issue) => {
      const matchesSearch =
        issue.issue.toLowerCase().includes(searchQuery.toLowerCase()) ||
        issue.department.toLowerCase().includes(searchQuery.toLowerCase()) ||
        issue.id.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesSeverity = severityFilter === "all" || issue.severity === severityFilter;
      const matchesStatus = statusFilter === "all" || issue.status === statusFilter;
      return matchesSearch && matchesSeverity && matchesStatus;
    });
  }, [complianceIssues, searchQuery, severityFilter, statusFilter]);

  // Styling helper for Severity badges
  const getSeverityBadgeStyles = (severity: Severity) => {
    switch (severity) {
      case "High":
        return "text-[#EF4444] bg-[#EF4444]/10 border-[#EF4444]/20";
      case "Medium":
        return "text-[#F59E0B] bg-[#F59E0B]/10 border-[#F59E0B]/20";
      case "Low":
        return "text-[#22C55E] bg-[#22C55E]/10 border-[#22C55E]/20";
      default:
        return "text-[#9CA3AF] bg-[#0F1512] border-[#232B27]";
    }
  };

  // Styling helper for Status badges
  const getStatusBadgeStyles = (status: ComplianceStatus) => {
    switch (status) {
      case "Resolved":
        return "text-[#22C55E] bg-[#22C55E]/10 border-[#22C55E]/20";
      case "In Progress":
        return "text-[#3B82F6] bg-[#3B82F6]/10 border-[#3B82F6]/20";
      case "Open":
      default:
        return "text-[#EF4444] bg-[#EF4444]/10 border-[#EF4444]/20";
    }
  };

  const getStatusDotColor = (status: ComplianceStatus) => {
    switch (status) {
      case "Resolved":
        return "bg-[#22C55E]";
      case "In Progress":
        return "bg-[#3B82F6]";
      case "Open":
      default:
        return "bg-[#EF4444]";
    }
  };

  return (
    <div className="space-y-6">
      {/* Metrics Bar */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-[#111815] border border-[#232B27] rounded-2xl p-6 shadow-lg shadow-black/40">
          <p className="text-sm font-medium text-[#9CA3AF] uppercase tracking-wider">
            Active Incidents
          </p>
          <p className="text-3xl font-semibold text-[#EF4444] mt-2">
            {metrics.unresolved}
          </p>
        </div>
        <div className="bg-[#111815] border border-[#232B27] rounded-2xl p-6 shadow-lg shadow-black/40">
          <p className="text-sm font-medium text-[#9CA3AF] uppercase tracking-wider">
            Resolved Issues
          </p>
          <p className="text-3xl font-semibold text-[#22C55E] mt-2">
            {metrics.resolved}
          </p>
        </div>
        <div className="bg-[#111815] border border-[#232B27] rounded-2xl p-6 shadow-lg shadow-black/40">
          <p className="text-sm font-medium text-[#9CA3AF] uppercase tracking-wider">
            Incident Load
          </p>
          <p className="text-3xl font-semibold text-[#F3F4F1] mt-2">
            {metrics.total}
          </p>
        </div>
      </div>

      {/* Control / Filter Bar */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-[#111815] border border-[#232B27] rounded-2xl p-4 shadow-lg shadow-black/40">
        <div className="relative w-full md:w-80">
          <span className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
            <SearchIcon />
          </span>
          <input
            type="text"
            placeholder="Search incident reports..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-[#0F1512] border border-[#232B27] rounded-xl text-sm text-[#F3F4F1] placeholder-[#9CA3AF]/60 focus:outline-none focus:ring-1 focus:ring-[#22C55E] focus:border-[#22C55E] transition-all"
          />
        </div>

        <div className="flex flex-wrap gap-3 w-full md:w-auto justify-end">
          <select
            value={severityFilter}
            onChange={(e) => setSeverityFilter(e.target.value)}
            className="px-3 py-2 bg-[#0F1512] border border-[#232B27] rounded-xl text-sm text-[#F3F4F1] focus:outline-none focus:ring-1 focus:ring-[#22C55E] focus:border-[#22C55E]"
          >
            <option value="all">All Severities</option>
            <option value="High">High Severity</option>
            <option value="Medium">Medium Severity</option>
            <option value="Low">Low Severity</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 bg-[#0F1512] border border-[#232B27] rounded-xl text-sm text-[#F3F4F1] focus:outline-none focus:ring-1 focus:ring-[#22C55E] focus:border-[#22C55E]"
          >
            <option value="all">All Statuses</option>
            <option value="Open">Open</option>
            <option value="In Progress">In Progress</option>
            <option value="Resolved">Resolved</option>
          </select>
        </div>
      </div>

      {/* Grid or Table */}
      <div className="bg-[#111815] border border-[#232B27] rounded-2xl overflow-hidden shadow-lg shadow-black/40">
        {filteredIssues.length === 0 ? (
          <div className="text-center py-16 text-[#9CA3AF]">
            No compliance incidents found matching the selected filter.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-[#232B27] bg-[#0F1512]">
                  <th className="p-4 text-sm font-semibold text-[#4ADE80] uppercase tracking-wider">
                    Issue Details
                  </th>
                  <th className="p-4 text-sm font-semibold text-[#4ADE80] uppercase tracking-wider">
                    Department
                  </th>
                  <th className="p-4 text-sm font-semibold text-[#4ADE80] uppercase tracking-wider">
                    Severity
                  </th>
                  <th className="p-4 text-sm font-semibold text-[#4ADE80] uppercase tracking-wider">
                    Status
                  </th>
                  <th className="p-4 text-sm font-semibold text-[#4ADE80] uppercase tracking-wider text-right">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#232B27]">
                {filteredIssues.map((issue) => (
                  <tr
                    key={issue.id}
                    className="hover:bg-[#0F1512] transition-colors group"
                  >
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <span className="p-2 bg-[#0F1512] border border-[#232B27] rounded-lg group-hover:border-[#22C55E]/30 transition-colors flex-shrink-0">
                          {issue.status === "Resolved" ? (
                            <ShieldCheckIcon />
                          ) : (
                            <ShieldAlertIcon />
                          )}
                        </span>
                        <div>
                          <p className="font-semibold text-[#F3F4F1] line-clamp-1">
                            {issue.issue}
                          </p>
                          <p className="text-xs text-[#9CA3AF] font-mono mt-0.5">
                            ID: {issue.id} • Audit ID: {issue.auditId}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4 text-sm text-[#F3F4F1] font-medium">
                      {issue.department}
                    </td>
                    <td className="p-4">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${getSeverityBadgeStyles(
                          issue.severity
                        )}`}
                      >
                        {issue.severity}
                      </span>
                    </td>
                    <td className="p-4">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${getStatusBadgeStyles(
                          issue.status
                        )}`}
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full mr-1.5 ${getStatusDotColor(
                            issue.status
                          )}`}
                        />
                        {issue.status}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      {issue.status === "Resolved" ? (
                        <span className="inline-flex items-center gap-1.5 text-xs text-[#22C55E] font-semibold bg-[#22C55E]/10 border border-[#22C55E]/20 px-3 py-1.5 rounded-xl">
                          <CheckIcon />
                          <span>Resolved</span>
                        </span>
                      ) : (
                        <button
                          type="button"
                          disabled={isPending}
                          onClick={() => handleResolveClick(issue.id)}
                          className="px-4 py-1.5 bg-[#22C55E] hover:bg-[#22C55E]/90 text-[#0B0F0D] font-semibold text-xs rounded-xl disabled:opacity-50 disabled:cursor-not-allowed transition-all inline-flex items-center gap-1.5"
                        >
                          {isPending && clickedIssueId === issue.id ? (
                            <>
                              <SpinnerIcon />
                              <span>Resolving...</span>
                            </>
                          ) : (
                            <span>Resolve</span>
                          )}
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
