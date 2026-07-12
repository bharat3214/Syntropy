"use client";

import {
  FormEvent,
  useCallback,
  useEffect,
  useMemo,
  useState,
  useTransition,
} from "react";
import Link from "next/link";

import PolicySection from "../api/governance/PolicySection";
import AuditsSection from "../api/governance/AuditsSection";
import ComplianceSection from "../api/governance/ComplianceSection";

type PolicyStatus = "Active" | "Draft";
type AcknowledgementStatus = "Acknowledged" | "Pending";
type AuditStatus = "Completed" | "Under Review" | "Scheduled";
type Severity = "High" | "Medium" | "Low";
type ComplianceStatus = "Open" | "Resolved" | "In Progress";

type Tab =
  | "policies"
  | "acknowledgements"
  | "audits"
  | "compliance";

interface Policy {
  id: string;
  title: string;
  department: string;
  description: string;
  status: PolicyStatus;
  version: string;
  effectiveDate: string;
}

interface PolicyAcknowledgement {
  id: string;
  policyId: string;
  employeeName: string;
  department: string;
  status: AcknowledgementStatus;
  dateSigned: string | null;
}

interface ComplianceIssue {
  id: string;
  auditId: string;
  issue: string;
  severity: Severity;
  department: string;
  status: ComplianceStatus;
}

interface Audit {
  id: string;
  title: string;
  department: string;
  auditor: string;
  date: string;
  findings: string;
  status: AuditStatus;
}

interface AuditWithIssues extends Audit {
  complianceIssues: ComplianceIssue[];
}

interface GovernanceResponse {
  policies: Policy[];
  acknowledgements: PolicyAcknowledgement[];
  audits: AuditWithIssues[];
  complianceIssues: ComplianceIssue[];
  analytics?: {
    complianceScore: number;
    totalOpenIssues: number;
    departmentLeaderboard: {
      department: string;
      unresolvedCount: number;
    }[];
  };
}

interface CreateAuditForm {
  title: string;
  department: string;
  auditor: string;
  date: string;
  findings: string;
  status: AuditStatus;
}

const initialForm: CreateAuditForm = {
  title: "",
  department: "",
  auditor: "",
  date: "",
  findings: "",
  status: "Scheduled",
};

export default function GovernancePage() {
  const [activeTab, setActiveTab] = useState<Tab>("policies");
  const [data, setData] = useState<GovernanceResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [auditForm, setAuditForm] =
    useState<CreateAuditForm>(initialForm);
  const [isPending, startTransition] = useTransition();

  const fetchGovernanceData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch("/api/governance", {
        cache: "no-store",
      });

      if (!response.ok) {
        throw new Error("Unable to load governance data.");
      }

      const payload: GovernanceResponse = await response.json();
      setData(payload);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unexpected error occurred."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchGovernanceData();
  }, [fetchGovernanceData]);

  const handleCreateAudit = async (
    event: FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    const response = await fetch("/api/governance", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        action: "CREATE_AUDIT",
        data: auditForm,
      }),
    });

    if (response.status === 201) {
      setAuditForm(initialForm);
      await fetchGovernanceData();
    }
  };

  const handleResolveCompliance = (issueId: string) => {
    startTransition(async () => {
      const response = await fetch("/api/governance", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          action: "RESOLVE_COMPLIANCE",
          data: {
            issueId,
          },
        }),
      });

      if (response.ok) {
        await fetchGovernanceData();
      }
    });
  };

  const handleExportAudits = async () => {
    const response = await fetch("/api/governance", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        action: "EXPORT_AUDITS",
        data: {},
      }),
    });

    if (!response.ok) return;

    const payload: { csv: string } = await response.json();

    const blob = new Blob([payload.csv], {
      type: "text/csv;charset=utf-8;",
    });

    const url = URL.createObjectURL(blob);

    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = "governance-audits.csv";
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();

    URL.revokeObjectURL(url);
  };

  const tabs = useMemo<
    { key: Tab; label: string }[]
  >(
    () => [
      { key: "policies", label: "Policies" },
      {
        key: "acknowledgements",
        label: "Acknowledgements",
      },
      { key: "audits", label: "Audits" },
      {
        key: "compliance",
        label: "Compliance",
      },
    ],
    []
  );

  return (
    <div className="min-h-screen bg-[#0B0F0D] text-[#F3F4F1] font-sans antialiased">
      <main className="mx-auto max-w-7xl space-y-8 p-6 md:p-8">
        <header className="space-y-6">
          <div className="flex items-center gap-3">
            <Link href="/" className="flex items-center gap-3 hover:opacity-85 transition-opacity cursor-pointer">
              <span className="p-2 bg-[#111815] border border-[#232B27] rounded-xl">
                <svg className="w-6 h-6 text-[#22C55E]" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
                  <path d="m9 12 2 2 4-4"></path>
                </svg>
              </span>
              <div>
                <h1 className="text-3xl font-bold tracking-tight text-[#4ADE80]">
                  Governance Dashboard
                </h1>
                <p className="text-sm text-[#9CA3AF]">
                  Manage corporate policy tracking, ESG audits, and compliance incidents.
                </p>
              </div>
            </Link>
          </div>

          {!loading && data && data.analytics && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
              <div className="bg-[#111815] border border-[#232B27] rounded-2xl p-6 shadow-lg shadow-black/40 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-semibold text-[#9CA3AF] uppercase tracking-wider">
                      ESG Compliance Score
                    </p>
                    <span className="p-2 bg-[#0F1512] border border-[#232B27] rounded-xl">
                      <svg className="w-5 h-5 text-[#22C55E]" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
                        <polyline points="9 11 11 13 15 9"></polyline>
                      </svg>
                    </span>
                  </div>
                  <div className="mt-4 flex items-baseline gap-2">
                    <span className="text-4xl font-extrabold tracking-tight text-[#4ADE80]">
                      {data.analytics.complianceScore.toFixed(1)}%
                    </span>
                    <span className="text-xs text-[#9CA3AF]">safety rating</span>
                  </div>
                </div>
                <div className="mt-6 space-y-2">
                  <div className="w-full bg-[#0F1512] rounded-full h-2 border border-[#232B27] overflow-hidden">
                    <div
                      className="bg-[#22C55E] h-1.5 rounded-full transition-all duration-500"
                      style={{ width: `${data.analytics.complianceScore}%` }}
                    />
                  </div>
                  <div className="flex items-center justify-between text-[10px] text-[#9CA3AF]">
                    <span>0%</span>
                    <span>100%</span>
                  </div>
                </div>
              </div>

              <div className="bg-[#111815] border border-[#232B27] rounded-2xl p-6 shadow-lg shadow-black/40 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-semibold text-[#9CA3AF] uppercase tracking-wider">
                      Outstanding Hazards
                    </p>
                    <span className="p-2 bg-[#0F1512] border border-[#232B27] rounded-xl">
                      <svg className="w-5 h-5 text-[#EF4444]" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
                        <line x1="12" y1="8" x2="12" y2="12"></line>
                        <line x1="12" y1="16" x2="12.01" y2="16"></line>
                      </svg>
                    </span>
                  </div>
                  <div className="mt-4 flex items-baseline gap-2">
                    <span className="text-4xl font-extrabold tracking-tight text-[#EF4444]">
                      {data.analytics.totalOpenIssues}
                    </span>
                    <span className="text-xs text-[#9CA3AF]">active incidents</span>
                  </div>
                </div>
                <div className="mt-6 text-xs text-[#9CA3AF]">
                  Requires resolution and safety review.
                </div>
              </div>

              <div className="bg-[#111815] border border-[#232B27] rounded-2xl p-6 shadow-lg shadow-black/40 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <p className="text-xs font-semibold text-[#9CA3AF] uppercase tracking-wider">
                      Sustainability Leaderboard
                    </p>
                    <span className="p-2 bg-[#0F1512] border border-[#232B27] rounded-xl">
                      <svg className="w-5 h-5 text-[#F59E0B]" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                        <circle cx="12" cy="8" r="7"></circle>
                        <polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88"></polyline>
                      </svg>
                    </span>
                  </div>
                  <div className="space-y-3">
                    {data.analytics.departmentLeaderboard.map((item, index) => (
                      <div key={item.department} className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-2">
                          <span className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold ${
                            index === 0 ? "bg-[#22C55E]/20 text-[#22C55E] border border-[#22C55E]/30" : "bg-[#0F1512] text-[#9CA3AF] border border-[#232B27]"
                          }`}>
                            {index + 1}
                          </span>
                          <span className="font-medium text-[#F3F4F1]">{item.department}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className={`px-2 py-0.5 rounded-full text-xs font-semibold border ${
                            item.unresolvedCount === 0 ? "bg-[#22C55E]/10 text-[#22C55E] border-[#22C55E]/20" : "bg-[#EF4444]/10 text-[#EF4444] border-[#EF4444]/20"
                          }`}>
                            {item.unresolvedCount} {item.unresolvedCount === 1 ? "hazard" : "hazards"}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          <nav className="flex flex-wrap gap-2 border-b border-[#232B27] pb-4">
            {tabs.map((tab) => (
              <button
                key={tab.key}
                type="button"
                onClick={() => setActiveTab(tab.key)}
                className={`rounded-xl px-4 py-2 text-sm font-semibold transition-all duration-150 ${
                  activeTab === tab.key
                    ? "bg-[#111815] border border-[#22C55E] text-[#22C55E] shadow-sm shadow-[#22C55E]/10"
                    : "bg-transparent border border-[#232B27] text-[#9CA3AF] hover:text-[#F3F4F1] hover:border-[#9CA3AF]/30"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </header>

        {loading && (
          <div className="space-y-6 animate-pulse">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-28 bg-[#111815] border border-[#232B27] rounded-2xl" />
              ))}
            </div>
            <div className="h-16 bg-[#111815] border border-[#232B27] rounded-2xl" />
            <div className="h-64 bg-[#111815] border border-[#232B27] rounded-2xl" />
          </div>
        )}

        {error && (
          <div className="p-4 bg-[#EF4444]/10 border border-[#EF4444]/20 rounded-2xl text-[#EF4444] text-sm flex items-center gap-2.5">
            <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="12" y1="8" x2="12" y2="12"></line>
              <line x1="12" y1="16" x2="12.01" y2="16"></line>
            </svg>
            <span>{error}</span>
          </div>
        )}

        {!loading && data && (
          <>
            {activeTab === "policies" && (
              <PolicySection
                policies={data.policies}
                acknowledgements={data.acknowledgements}
                activeTab="policies"
              />
            )}

            {activeTab === "acknowledgements" && (
              <PolicySection
                policies={data.policies}
                acknowledgements={data.acknowledgements}
                activeTab="acknowledgements"
              />
            )}

            {activeTab === "audits" && (
              <AuditsSection
                audits={data.audits}
                auditForm={auditForm}
                setAuditForm={setAuditForm}
                onCreateAudit={handleCreateAudit}
                onExportAudits={handleExportAudits}
              />
            )}

            {activeTab === "compliance" && (
              <ComplianceSection
                complianceIssues={data.complianceIssues}
                onResolveIssue={handleResolveCompliance}
                isPending={isPending}
              />
            )}
          </>
        )}
      </main>
    </div>
  );
}
