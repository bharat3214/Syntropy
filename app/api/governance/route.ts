import { NextRequest, NextResponse } from "next/server";

type PolicyStatus = "Active" | "Draft";
type AcknowledgementStatus = "Acknowledged" | "Pending";
type AuditStatus = "Completed" | "Under Review" | "Scheduled";
type Severity = "High" | "Medium" | "Low";
type ComplianceStatus = "Open" | "Resolved" | "In Progress";

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

interface Audit {
  id: string;
  title: string;
  department: string;
  auditor: string;
  date: string;
  findings: string;
  status: AuditStatus;
}

interface ComplianceIssue {
  id: string;
  auditId: string;
  issue: string;
  severity: Severity;
  department: string;
  status: ComplianceStatus;
}

interface OptimisedAuditPayload extends Audit {
  complianceIssues: ComplianceIssue[];
}

const policiesMap = new Map<string, Policy>([
  ["POL-001", { id: "POL-001", title: "Environmental Management Policy", department: "Operations", description: "Defines environmental stewardship and waste management procedures.", status: "Active", version: "2.1", effectiveDate: "2025-01-15" }],
  ["POL-002", { id: "POL-002", title: "Vendor Compliance Policy", department: "Procurement", description: "Establishes supplier ESG disclosure requirements.", status: "Active", version: "1.4", effectiveDate: "2025-03-01" }],
  ["POL-003", { id: "POL-003", title: "Chemical Safety Policy", department: "Manufacturing", description: "Standards for hazardous material handling and documentation.", status: "Draft", version: "0.9", effectiveDate: "2025-09-01" }]
]);

const acknowledgementsMap = new Map<string, PolicyAcknowledgement>([
  ["ACK-001", { id: "ACK-001", policyId: "POL-001", employeeName: "Ava Patel", department: "Operations", status: "Acknowledged", dateSigned: "2025-01-20" }],
  ["ACK-002", { id: "ACK-002", policyId: "POL-002", employeeName: "Liam Chen", department: "Procurement", status: "Pending", dateSigned: null }],
  ["ACK-003", { id: "ACK-003", policyId: "POL-003", employeeName: "Sophia Williams", department: "Manufacturing", status: "Pending", dateSigned: null }]
]);

const auditsMap = new Map<string, Audit>([
  ["AUD-001", { id: "AUD-001", title: "Q2 Waste Audit", department: "Operations", auditor: "Emma Brooks", date: "2025-06-12", findings: "Minor waste segregation inconsistencies.", status: "Completed" }],
  ["AUD-002", { id: "AUD-002", title: "Vendor Compliance Check", department: "Procurement", auditor: "Noah Singh", date: "2025-07-02", findings: "Awaiting vendor disclosure verification.", status: "Under Review" }],
  ["AUD-003", { id: "AUD-003", title: "Safety Documentation Review", department: "Manufacturing", auditor: "Olivia Carter", date: "2025-08-15", findings: "Scheduled inspection.", status: "Scheduled" }]
]);

const complianceMap = new Map<string, ComplianceIssue>([
  ["CMP-001", { id: "CMP-001", auditId: "AUD-001", issue: "Missing MSDS sheets", severity: "High", department: "Manufacturing", status: "Open" }],
  ["CMP-002", { id: "CMP-002", auditId: "AUD-002", issue: "Late vendor disclosure", severity: "Medium", department: "Procurement", status: "In Progress" }],
  ["CMP-003", { id: "CMP-003", auditId: "AUD-001", issue: "Waste container labeling", severity: "Low", department: "Operations", status: "Resolved" }]
]);

const generateId = (prefix: string): string =>
  `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

export async function GET() {
  const complianceByAuditId: Record<string, ComplianceIssue[]> = {};
  for (const issue of complianceMap.values()) {
    if (!complianceByAuditId[issue.auditId]) {
      complianceByAuditId[issue.auditId] = [];
    }
    complianceByAuditId[issue.auditId].push(issue);
  }

  const optimizedAudits: OptimisedAuditPayload[] = [];
  for (const audit of auditsMap.values()) {
    optimizedAudits.push({
      ...audit,
      complianceIssues: complianceByAuditId[audit.id] || [],
    });
  }

  const totalIssues = complianceMap.size;
  const resolvedIssues = Array.from(complianceMap.values()).filter(
    (c) => c.status === "Resolved"
  ).length;
  const complianceScore = totalIssues > 0 ? (resolvedIssues / totalIssues) * 100 : 100;

  const totalOpenIssues = Array.from(complianceMap.values()).filter(
    (c) => c.status === "Open" || c.status === "In Progress"
  ).length;

  const departments = new Set<string>();
  for (const p of policiesMap.values()) departments.add(p.department);
  for (const a of acknowledgementsMap.values()) departments.add(a.department);
  for (const au of auditsMap.values()) departments.add(au.department);
  for (const c of complianceMap.values()) departments.add(c.department);

  const departmentLeaderboard = Array.from(departments)
    .map((dept) => {
      const unresolvedCount = Array.from(complianceMap.values()).filter(
        (c) =>
          c.department === dept &&
          (c.status === "Open" || c.status === "In Progress")
      ).length;
      return { department: dept, unresolvedCount };
    })
    .sort((a, b) => a.unresolvedCount - b.unresolvedCount);

  return NextResponse.json(
    {
      policies: Array.from(policiesMap.values()),
      acknowledgements: Array.from(acknowledgementsMap.values()),
      audits: optimizedAudits,
      complianceIssues: Array.from(complianceMap.values()),
      analytics: {
        complianceScore,
        totalOpenIssues,
        departmentLeaderboard,
      },
    },
    { status: 200 }
  );
}

export async function POST(req: NextRequest) {
  let body: any;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON payload." }, { status: 400 });
  }

  const { action, data } = body;

  switch (action) {
    case "CREATE_AUDIT": {
      if (!data.title || !data.department || !data.auditor || !data.date || !data.findings || !data.status) {
        return NextResponse.json({ error: "Missing required fields." }, { status: 400 });
      }
      const id = generateId("AUD");
      const newAudit: Audit = { id, ...data };
      auditsMap.set(id, newAudit);
      return NextResponse.json(newAudit, { status: 201 });
    }

    case "EXPORT_AUDITS": {
      const headers = ["id", "title", "department", "auditor", "date", "findings", "status"];
      const rows: string[] = [];
      for (const audit of auditsMap.values()) {
        rows.push([
          audit.id,
          audit.title,
          audit.department,
          audit.auditor,
          audit.date,
          audit.findings,
          audit.status
        ].map(val => `"${String(val).replace(/"/g, '""')}"`).join(","));
      }
      const csv = [headers.join(","), ...rows].join("\n");
      return NextResponse.json({ csv }, { status: 200 });
    }

    case "ACKNOWLEDGE_POLICY": {
      const ack = acknowledgementsMap.get(data.acknowledgementId);
      if (!ack) return NextResponse.json({ error: "Not found." }, { status: 404 });
      ack.status = "Acknowledged";
      ack.dateSigned = new Date().toISOString().split("T")[0];
      return NextResponse.json(ack, { status: 200 });
    }

    case "RESOLVE_COMPLIANCE": {
      const issue = complianceMap.get(data.issueId);
      if (!issue) return NextResponse.json({ error: "Not found." }, { status: 404 });
      issue.status = "Resolved";
      return NextResponse.json(issue, { status: 200 });
    }

    case "RAISE_COMPLIANCE": {
      if (!data.auditId || !data.issue || !data.severity || !data.department) {
        return NextResponse.json({ error: "Missing required fields." }, { status: 400 });
      }
      if (!auditsMap.has(data.auditId)) {
        return NextResponse.json({ error: "Referenced audit not found." }, { status: 404 });
      }
      const id = generateId("CMP");
      const newIssue: ComplianceIssue = { id, status: "Open", ...data };
      complianceMap.set(id, newIssue);
      return NextResponse.json(newIssue, { status: 201 });
    }

    default:
      return NextResponse.json({ error: "Unsupported action." }, { status: 400 });
  }
}
