"use client";

import React, { useState, useMemo } from "react";

export type PolicyStatus = "Active" | "Draft";
export type AcknowledgementStatus = "Acknowledged" | "Pending";

export interface Policy {
  id: string;
  title: string;
  department: string;
  description: string;
  status: PolicyStatus;
  version: string;
  effectiveDate: string;
}

export interface PolicyAcknowledgement {
  id: string;
  policyId: string;
  employeeName: string;
  department: string;
  status: AcknowledgementStatus;
  dateSigned: string | null;
}

interface PolicySectionProps {
  policies: Policy[];
  acknowledgements: PolicyAcknowledgement[];
  activeTab: "policies" | "acknowledgements";
}

// Inline custom SVG Icons matching spec: 2px stroke, outline style, rounded joins and caps.
const SearchIcon = () => (
  <svg className="w-4 h-4 text-[#9CA3AF]" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
    <circle cx="11" cy="11" r="8"></circle>
    <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
  </svg>
);

const FileTextIcon = () => (
  <svg className="w-5 h-5 text-[#22C55E]" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
    <polyline points="14 2 14 8 20 8"></polyline>
    <line x1="16" y1="13" x2="8" y2="13"></line>
    <line x1="16" y1="17" x2="8" y2="17"></line>
    <polyline points="10 9 9 9 8 9"></polyline>
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

export default function PolicySection({
  policies,
  acknowledgements,
  activeTab,
}: PolicySectionProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  // Summary Metrics
  const metrics = useMemo(() => {
    if (activeTab === "policies") {
      const activeCount = policies.filter((p) => p.status === "Active").length;
      const draftCount = policies.filter((p) => p.status === "Draft").length;
      return {
        total: policies.length,
        primaryLabel: "Active Policies",
        primaryValue: activeCount,
        secondaryLabel: "Draft Policies",
        secondaryValue: draftCount,
      };
    } else {
      const ackCount = acknowledgements.filter((a) => a.status === "Acknowledged").length;
      const pendingCount = acknowledgements.filter((a) => a.status === "Pending").length;
      const rate = acknowledgements.length
        ? Math.round((ackCount / acknowledgements.length) * 100)
        : 0;
      return {
        total: acknowledgements.length,
        primaryLabel: "Acknowledged",
        primaryValue: ackCount,
        secondaryLabel: "Completion Rate",
        secondaryValue: `${rate}%`,
      };
    }
  }, [policies, acknowledgements, activeTab]);

  // Filtered lists
  const filteredPolicies = useMemo(() => {
    return policies.filter((policy) => {
      const matchesSearch =
        policy.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        policy.department.toLowerCase().includes(searchQuery.toLowerCase()) ||
        policy.description.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = statusFilter === "all" || policy.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [policies, searchQuery, statusFilter]);

  const filteredAcks = useMemo(() => {
    return acknowledgements.filter((ack) => {
      const matchesSearch =
        ack.employeeName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        ack.department.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = statusFilter === "all" || ack.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [acknowledgements, searchQuery, statusFilter]);

  return (
    <div className="space-y-6">
      {/* Metrics Bar */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-[#111815] border border-[#232B27] rounded-2xl p-6 shadow-lg shadow-black/40">
          <p className="text-sm font-medium text-[#9CA3AF] uppercase tracking-wider">
            Total {activeTab === "policies" ? "Policies" : "Ledger Records"}
          </p>
          <p className="text-3xl font-semibold text-[#F3F4F1] mt-2">{metrics.total}</p>
        </div>
        <div className="bg-[#111815] border border-[#232B27] rounded-2xl p-6 shadow-lg shadow-black/40">
          <p className="text-sm font-medium text-[#9CA3AF] uppercase tracking-wider">
            {metrics.primaryLabel}
          </p>
          <p className="text-3xl font-semibold text-[#22C55E] mt-2">
            {metrics.primaryValue}
          </p>
        </div>
        <div className="bg-[#111815] border border-[#232B27] rounded-2xl p-6 shadow-lg shadow-black/40">
          <p className="text-sm font-medium text-[#9CA3AF] uppercase tracking-wider">
            {metrics.secondaryLabel}
          </p>
          <p className="text-3xl font-semibold text-[#F3F4F1] mt-2">
            {metrics.secondaryValue}
          </p>
        </div>
      </div>

      {/* Control / Filter Bar */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between bg-[#111815] border border-[#232B27] rounded-2xl p-4 shadow-lg shadow-black/40">
        <div className="relative w-full sm:w-80">
          <span className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
            <SearchIcon />
          </span>
          <input
            type="text"
            placeholder={
              activeTab === "policies"
                ? "Search policies..."
                : "Search employees..."
            }
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-[#0F1512] border border-[#232B27] rounded-xl text-sm text-[#F3F4F1] placeholder-[#9CA3AF]/60 focus:outline-none focus:ring-1 focus:ring-[#22C55E] focus:border-[#22C55E] transition-all"
          />
        </div>

        <div className="flex gap-2 w-full sm:w-auto justify-end">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 bg-[#0F1512] border border-[#232B27] rounded-xl text-sm text-[#F3F4F1] focus:outline-none focus:ring-1 focus:ring-[#22C55E] focus:border-[#22C55E]"
          >
            <option value="all">All Statuses</option>
            {activeTab === "policies" ? (
              <>
                <option value="Active">Active</option>
                <option value="Draft">Draft</option>
              </>
            ) : (
              <>
                <option value="Acknowledged">Acknowledged</option>
                <option value="Pending">Pending</option>
              </>
            )}
          </select>
        </div>
      </div>

      {/* Main Content Area */}
      {activeTab === "policies" ? (
        <div className="grid grid-cols-1 gap-4">
          {filteredPolicies.length === 0 ? (
            <div className="text-center py-12 bg-[#111815] border border-[#232B27] rounded-2xl text-[#9CA3AF]">
              No policies found matching your search.
            </div>
          ) : (
            <div className="bg-[#111815] border border-[#232B27] rounded-2xl overflow-hidden shadow-lg shadow-black/40">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-[#232B27] bg-[#0F1512]">
                      <th className="p-4 text-sm font-semibold text-[#4ADE80] uppercase tracking-wider">
                        Policy
                      </th>
                      <th className="p-4 text-sm font-semibold text-[#4ADE80] uppercase tracking-wider">
                        Department
                      </th>
                      <th className="p-4 text-sm font-semibold text-[#4ADE80] uppercase tracking-wider">
                        Version
                      </th>
                      <th className="p-4 text-sm font-semibold text-[#4ADE80] uppercase tracking-wider">
                        Effective Date
                      </th>
                      <th className="p-4 text-sm font-semibold text-[#4ADE80] uppercase tracking-wider text-right">
                        Status
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#232B27]">
                    {filteredPolicies.map((policy) => (
                      <tr
                        key={policy.id}
                        className="hover:bg-[#0F1512] transition-colors group"
                      >
                        <td className="p-4">
                          <div className="flex items-start gap-3">
                            <span className="p-2 bg-[#0F1512] border border-[#232B27] rounded-lg group-hover:border-[#22C55E]/30 transition-colors">
                              <FileTextIcon />
                            </span>
                            <div className="space-y-1">
                              <p className="font-semibold text-[#F3F4F1]">
                                {policy.title}
                              </p>
                              <p className="text-xs text-[#9CA3AF] max-w-lg">
                                {policy.description}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="p-4 text-sm text-[#F3F4F1] font-medium">
                          {policy.department}
                        </td>
                        <td className="p-4 text-sm text-[#9CA3AF] font-mono">
                          v{policy.version}
                        </td>
                        <td className="p-4 text-sm text-[#9CA3AF]">
                          <div className="flex items-center gap-1.5">
                            <CalendarIcon />
                            <span>{policy.effectiveDate}</span>
                          </div>
                        </td>
                        <td className="p-4 text-right">
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${
                              policy.status === "Active"
                                ? "bg-[#22C55E]/10 border-[#22C55E]/20 text-[#22C55E]"
                                : "bg-zinc-500/10 border-zinc-500/20 text-[#9CA3AF]"
                            }`}
                          >
                            <span
                              className={`w-1.5 h-1.5 rounded-full mr-1.5 ${
                                policy.status === "Active"
                                  ? "bg-[#22C55E]"
                                  : "bg-zinc-400"
                              }`}
                            />
                            {policy.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="bg-[#111815] border border-[#232B27] rounded-2xl overflow-hidden shadow-lg shadow-black/40">
          {filteredAcks.length === 0 ? (
            <div className="text-center py-12 text-[#9CA3AF]">
              No employees found matching your search.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-[#232B27] bg-[#0F1512]">
                    <th className="p-4 text-sm font-semibold text-[#4ADE80] uppercase tracking-wider">
                      Employee Name
                    </th>
                    <th className="p-4 text-sm font-semibold text-[#4ADE80] uppercase tracking-wider">
                      Department
                    </th>
                    <th className="p-4 text-sm font-semibold text-[#4ADE80] uppercase tracking-wider">
                      Signed Date
                    </th>
                    <th className="p-4 text-sm font-semibold text-[#4ADE80] uppercase tracking-wider text-right">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#232B27]">
                  {filteredAcks.map((ack) => (
                    <tr
                      key={ack.id}
                      className="hover:bg-[#0F1512] transition-colors"
                    >
                      <td className="p-4 font-semibold text-[#F3F4F1]">
                        {ack.employeeName}
                      </td>
                      <td className="p-4 text-sm text-[#9CA3AF]">{ack.department}</td>
                      <td className="p-4 text-sm text-[#9CA3AF]">
                        <div className="flex items-center gap-1.5">
                          <CalendarIcon />
                          <span>{ack.dateSigned ?? "-"}</span>
                        </div>
                      </td>
                      <td className="p-4 text-right">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${
                            ack.status === "Acknowledged"
                              ? "bg-[#22C55E]/10 border-[#22C55E]/20 text-[#22C55E]"
                              : "bg-[#F59E0B]/10 border-[#F59E0B]/20 text-[#F59E0B]"
                          }`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full mr-1.5 ${
                              ack.status === "Acknowledged"
                                ? "bg-[#22C55E]"
                                : "bg-[#F59E0B]"
                            }`}
                          />
                          {ack.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
