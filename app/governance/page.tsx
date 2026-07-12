"use client";

import {
  FormEvent,
  useCallback,
  useEffect,
  useMemo,
  useState,
  useTransition,
} from "react";

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
    <main className="mx-auto max-w-7xl space-y-6 p-6">
      <header className="space-y-4">
        <h1 className="text-3xl font-bold">
          Governance Dashboard
        </h1>

        <nav className="flex flex-wrap gap-2">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              type="button"
              onClick={() => setActiveTab(tab.key)}
              className={`rounded border px-4 py-2 ${
                activeTab === tab.key
                  ? "font-semibold"
                  : ""
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </header>

      {loading && <p>Loading...</p>}

      {error && <p>{error}</p>}

      {!loading && data && (
        <>
          {activeTab === "policies" && (
            <section className="space-y-4">
              <table className="w-full border-collapse border">
                <thead>
                  <tr>
                    <th className="border p-2">Title</th>
                    <th className="border p-2">
                      Department
                    </th>
                    <th className="border p-2">
                      Status
                    </th>
                    <th className="border p-2">
                      Version
                    </th>
                    <th className="border p-2">
                      Effective
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {data.policies.map((policy) => (
                    <tr key={policy.id}>
                      <td className="border p-2">
                        {policy.title}
                      </td>
                      <td className="border p-2">
                        {policy.department}
                      </td>
                      <td className="border p-2">
                        {policy.status}
                      </td>
                      <td className="border p-2">
                        {policy.version}
                      </td>
                      <td className="border p-2">
                        {policy.effectiveDate}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </section>
          )}

          {activeTab === "acknowledgements" && (
            <section>
              <table className="w-full border-collapse border">
                <thead>
                  <tr>
                    <th className="border p-2">
                      Employee
                    </th>
                    <th className="border p-2">
                      Department
                    </th>
                    <th className="border p-2">
                      Status
                    </th>
                    <th className="border p-2">
                      Date Signed
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {data.acknowledgements.map((ack) => (
                    <tr key={ack.id}>
                      <td className="border p-2">
                        {ack.employeeName}
                      </td>
                      <td className="border p-2">
                        {ack.department}
                      </td>
                      <td className="border p-2">
                        {ack.status}
                      </td>
                      <td className="border p-2">
                        {ack.dateSigned ?? "-"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </section>
          )}

          {activeTab === "audits" && (
            <section className="space-y-8">
              <form
                onSubmit={handleCreateAudit}
                className="grid grid-cols-1 gap-3 md:grid-cols-2"
              >
                <input
                  required
                  placeholder="Title"
                  value={auditForm.title}
                  onChange={(e) =>
                    setAuditForm((prev) => ({
                      ...prev,
                      title: e.target.value,
                    }))
                  }
                  className="border p-2"
                />

                <input
                  required
                  placeholder="Department"
                  value={auditForm.department}
                  onChange={(e) =>
                    setAuditForm((prev) => ({
                      ...prev,
                      department: e.target.value,
                    }))
                  }
                  className="border p-2"
                />

                <input
                  required
                  placeholder="Auditor"
                  value={auditForm.auditor}
                  onChange={(e) =>
                    setAuditForm((prev) => ({
                      ...prev,
                      auditor: e.target.value,
                    }))
                  }
                  className="border p-2"
                />

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
                  className="border p-2"
                />

                <input
                  required
                  placeholder="Findings"
                  value={auditForm.findings}
                  onChange={(e) =>
                    setAuditForm((prev) => ({
                      ...prev,
                      findings: e.target.value,
                    }))
                  }
                  className="border p-2 md:col-span-2"
                />

                <select
                  value={auditForm.status}
                  onChange={(e) =>
                    setAuditForm((prev) => ({
                      ...prev,
                      status:
                        e.target
                          .value as AuditStatus,
                    }))
                  }
                  className="border p-2"
                >
                  <option>Scheduled</option>
                  <option>Under Review</option>
                  <option>Completed</option>
                </select>

                <div className="flex gap-2">
                  <button
                    type="submit"
                    className="border px-4 py-2"
                  >
                    + New Audit
                  </button>

                  <button
                    type="button"
                    onClick={handleExportAudits}
                    className="border px-4 py-2"
                  >
                    Export
                  </button>
                </div>
              </form>

              <table className="w-full border-collapse border">
                <thead>
                  <tr>
                    <th className="border p-2">
                      Title
                    </th>
                    <th className="border p-2">
                      Department
                    </th>
                    <th className="border p-2">
                      Auditor
                    </th>
                    <th className="border p-2">
                      Status
                    </th>
                    <th className="border p-2">
                      Issues
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {data.audits.map((audit) => (
                    <tr key={audit.id}>
                      <td className="border p-2">
                        {audit.title}
                      </td>
                      <td className="border p-2">
                        {audit.department}
                      </td>
                      <td className="border p-2">
                        {audit.auditor}
                      </td>
                      <td className="border p-2">
                        {audit.status}
                      </td>
                      <td className="border p-2">
                        {audit.complianceIssues
                          .length}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </section>
          )}

          {activeTab === "compliance" && (
            <section>
              <table className="w-full border-collapse border">
                <thead>
                  <tr>
                    <th className="border p-2">
                      Issue
                    </th>
                    <th className="border p-2">
                      Severity
                    </th>
                    <th className="border p-2">
                      Department
                    </th>
                    <th className="border p-2">
                      Status
                    </th>
                    <th className="border p-2">
                      Action
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {data.complianceIssues.map(
                    (issue) => (
                      <tr key={issue.id}>
                        <td className="border p-2">
                          {issue.issue}
                        </td>
                        <td className="border p-2">
                          {issue.severity}
                        </td>
                        <td className="border p-2">
                          {issue.department}
                        </td>
                        <td className="border p-2">
                          {issue.status}
                        </td>
                        <td className="border p-2">
                          <button
                            type="button"
                            disabled={
                              isPending ||
                              issue.status ===
                                "Resolved"
                            }
                            onClick={() =>
                              handleResolveCompliance(
                                issue.id
                              )
                            }
                            className="border px-3 py-1"
                          >
                            Resolve
                          </button>
                        </td>
                      </tr>
                    )
                  )}
                </tbody>
              </table>
            </section>
          )}
        </>
      )}
    </main>
  );
}