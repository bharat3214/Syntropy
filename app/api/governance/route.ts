import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import path from "path";

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

const dbPath = path.join(process.cwd(), "dev.db");
const adapter = new PrismaBetterSqlite3({
  url: `file:${dbPath}`
});
const prisma = new PrismaClient({ adapter });

const generateId = (prefix: string): string =>
  `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

export async function GET() {
  const policies = await prisma.policy.findMany();
  const acknowledgements = await prisma.policyAcknowledgement.findMany();
  const complianceIssues = await prisma.complianceIssue.findMany();
  const audits = await prisma.audit.findMany({
    include: {
      complianceIssues: true
    }
  });

  const totalIssues = complianceIssues.length;
  const resolvedIssues = complianceIssues.filter(
    (c) => c.status === "Resolved"
  ).length;
  const complianceScore = totalIssues > 0 ? (resolvedIssues / totalIssues) * 100 : 100;

  const totalOpenIssues = complianceIssues.filter(
    (c) => c.status === "Open" || c.status === "In Progress"
  ).length;

  const departments = new Set<string>();
  for (const p of policies) departments.add(p.department);
  for (const a of acknowledgements) departments.add(a.department);
  for (const au of audits) departments.add(au.department);
  for (const c of complianceIssues) departments.add(c.department);

  const departmentLeaderboard = Array.from(departments)
    .map((dept) => {
      const unresolvedCount = complianceIssues.filter(
        (c) =>
          c.department === dept &&
          (c.status === "Open" || c.status === "In Progress")
      ).length;
      return { department: dept, unresolvedCount };
    })
    .sort((a, b) => a.unresolvedCount - b.unresolvedCount);

  return NextResponse.json(
    {
      policies,
      acknowledgements,
      audits,
      complianceIssues,
      analytics: {
        complianceScore,
        totalOpenIssues,
        departmentLeaderboard
      }
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
      const newAudit = await prisma.audit.create({
        data: {
          id,
          title: data.title,
          department: data.department,
          auditor: data.auditor,
          date: data.date,
          findings: data.findings,
          status: data.status
        }
      });
      return NextResponse.json(newAudit, { status: 201 });
    }

    case "EXPORT_AUDITS": {
      const audits = await prisma.audit.findMany();
      const headers = ["id", "title", "department", "auditor", "date", "findings", "status"];
      const rows: string[] = [];
      for (const audit of audits) {
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
      const ack = await prisma.policyAcknowledgement.findUnique({
        where: { id: data.acknowledgementId }
      });
      if (!ack) return NextResponse.json({ error: "Not found." }, { status: 404 });
      const updatedAck = await prisma.policyAcknowledgement.update({
        where: { id: data.acknowledgementId },
        data: {
          status: "Acknowledged",
          dateSigned: new Date().toISOString().split("T")[0]
        }
      });
      return NextResponse.json(updatedAck, { status: 200 });
    }

    case "RESOLVE_COMPLIANCE": {
      const issue = await prisma.complianceIssue.findUnique({
        where: { id: data.issueId }
      });
      if (!issue) return NextResponse.json({ error: "Not found." }, { status: 404 });
      const updatedIssue = await prisma.complianceIssue.update({
        where: { id: data.issueId },
        data: {
          status: "Resolved"
        }
      });
      return NextResponse.json(updatedIssue, { status: 200 });
    }

    case "RAISE_COMPLIANCE": {
      if (!data.auditId || !data.issue || !data.severity || !data.department) {
        return NextResponse.json({ error: "Missing required fields." }, { status: 400 });
      }
      const audit = await prisma.audit.findUnique({
        where: { id: data.auditId }
      });
      if (!audit) {
        return NextResponse.json({ error: "Referenced audit not found." }, { status: 404 });
      }
      const id = generateId("CMP");
      const newIssue = await prisma.complianceIssue.create({
        data: {
          id,
          auditId: data.auditId,
          issue: data.issue,
          severity: data.severity,
          department: data.department,
          status: "Open"
        }
      });
      return NextResponse.json(newIssue, { status: 201 });
    }

    default:
      return NextResponse.json({ error: "Unsupported action." }, { status: 400 });
  }
}
