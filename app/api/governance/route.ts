import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

interface Policy {
  id: string;
  title: string;
  departmentId: string;
  departmentName: string;
  description: string;
  status: string;
  version: string;
  effectiveDate: Date;
}

interface PolicyAcknowledgement {
  id: string;
  policyId: string;
  employeeName: string;
  departmentId: string;
  departmentName: string;
  status: string;
  dateSigned: Date | null;
}

interface Audit {
  id: string;
  title: string;
  departmentId: string;
  departmentName: string;
  auditor: string;
  date: Date;
  findings: string;
  status: string;
}

interface ComplianceIssue {
  id: string;
  auditId: string;
  issue: string;
  severity: string;
  departmentId: string;
  departmentName: string;
  status: string;
}

interface OptimisedAuditPayload extends Omit<Audit, "departmentName"> {
  complianceIssues: ComplianceIssue[];
}

export async function GET() {
  const [policiesRaw, acknowledgementsRaw, complianceIssuesRaw, auditsRaw] = await Promise.all([
    prisma.policy.findMany({ include: { department: true } }),
    prisma.policyAcknowledgement.findMany({ include: { policy: { include: { department: true } }, employee: true } }),
    prisma.complianceIssue.findMany({ include: { department: true } }),
    prisma.audit.findMany({ include: { complianceIssues: { include: { department: true } }, department: true } }),
  ]);

  const policies: Policy[] = policiesRaw.map((p) => ({
    id: p.id,
    title: p.title,
    departmentId: p.departmentId,
    departmentName: p.department.name,
    description: p.description,
    status: p.status,
    version: p.version,
    effectiveDate: p.effectiveDate,
  }));

  const acknowledgements: PolicyAcknowledgement[] = acknowledgementsRaw.map((a) => ({
    id: a.id,
    policyId: a.policyId,
    employeeName: `${a.employee.firstName ?? ""} ${a.employee.lastName ?? ""}`.trim(),
    departmentId: a.policy.departmentId,
    departmentName: a.policy.department.name,
    status: a.status,
    dateSigned: a.dateSigned,
  }));

  const audits: OptimisedAuditPayload[] = auditsRaw.map((au) => ({
    id: au.id,
    title: au.title,
    departmentId: au.departmentId,
    auditor: au.auditor,
    date: au.date,
    findings: au.findings,
    status: au.status,
    complianceIssues: au.complianceIssues.map((ci) => ({
      id: ci.id,
      auditId: ci.auditId,
      issue: ci.issue,
      severity: ci.severity,
      departmentId: ci.departmentId,
      departmentName: ci.department.name,
      status: ci.status,
    })),
  }));

  const complianceIssues: ComplianceIssue[] = complianceIssuesRaw.map((ci) => ({
    id: ci.id,
    auditId: ci.auditId,
    issue: ci.issue,
    severity: ci.severity,
    departmentId: ci.departmentId,
    departmentName: ci.department.name,
    status: ci.status,
  }));

  const totalIssues = complianceIssues.length;
  const resolvedIssues = complianceIssues.filter((c) => c.status === "Resolved").length;
  const complianceScore = totalIssues > 0 ? (resolvedIssues / totalIssues) * 100 : 100;

  const totalOpenIssues = complianceIssues.filter((c) => c.status === "Open" || c.status === "In Progress").length;

  const deptMap = new Map<string, string>();
  for (const p of policies) deptMap.set(p.departmentId, p.departmentName);
  for (const a of acknowledgements) deptMap.set(a.departmentId, a.departmentName);
  for (const au of audits) deptMap.set(au.departmentId, "");
  for (const c of complianceIssues) deptMap.set(c.departmentId, c.departmentName);

  const allDepts = await prisma.department.findMany();
  for (const d of allDepts) {
    if (!deptMap.has(d.id)) deptMap.set(d.id, d.name);
    else if (!deptMap.get(d.id)) deptMap.set(d.id, d.name);
  }

  const departmentLeaderboard = Array.from(deptMap.entries())
    .map(([deptId, deptName]) => {
      const unresolvedCount = complianceIssues.filter((c) => c.departmentId === deptId && (c.status === "Open" || c.status === "In Progress")).length;
      return { departmentId: deptId, departmentName: deptName, unresolvedCount };
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
      if (!data.title || !data.departmentId || !data.auditor || !data.date || !data.findings || !data.status) {
        return NextResponse.json({ error: "Missing required fields." }, { status: 400 });
      }
      const newAudit = await prisma.audit.create({
        data: {
          title: data.title,
          departmentId: data.departmentId,
          auditor: data.auditor,
          date: new Date(data.date),
          findings: data.findings,
          status: data.status,
        },
      });
      return NextResponse.json(newAudit, { status: 201 });
    }

    case "EXPORT_AUDITS": {
      const auditsRaw = await prisma.audit.findMany({ include: { department: true } });
      const headers = ["id", "title", "department", "auditor", "date", "findings", "status"];
      const rows: string[] = [];
      for (const au of auditsRaw) {
        rows.push(
          [au.id, au.title, au.department.name, au.auditor, au.date.toISOString(), au.findings, au.status]
            .map((val) => `"${String(val).replace(/"/g, '""')}"`)
            .join(",")
        );
      }
      const csv = [headers.join(","), ...rows].join("\n");
      return NextResponse.json({ csv }, { status: 200 });
    }

    case "ACKNOWLEDGE_POLICY": {
      const ack = await prisma.policyAcknowledgement.findUnique({
        where: { id: data.acknowledgementId },
      });
      if (!ack) return NextResponse.json({ error: "Not found." }, { status: 404 });
      const updatedAck = await prisma.policyAcknowledgement.update({
        where: { id: data.acknowledgementId },
        data: {
          status: "Acknowledged",
          dateSigned: new Date(),
        },
      });
      return NextResponse.json(updatedAck, { status: 200 });
    }

    case "RESOLVE_COMPLIANCE": {
      const issue = await prisma.complianceIssue.findUnique({
        where: { id: data.issueId },
      });
      if (!issue) return NextResponse.json({ error: "Not found." }, { status: 404 });
      const updatedIssue = await prisma.complianceIssue.update({
        where: { id: data.issueId },
        data: { status: "Resolved" },
      });
      return NextResponse.json(updatedIssue, { status: 200 });
    }

    case "RAISE_COMPLIANCE": {
      if (!data.auditId || !data.issue || !data.severity || !data.departmentId) {
        return NextResponse.json({ error: "Missing required fields." }, { status: 400 });
      }
      const audit = await prisma.audit.findUnique({
        where: { id: data.auditId },
      });
      if (!audit) {
        return NextResponse.json({ error: "Referenced audit not found." }, { status: 404 });
      }
      const newIssue = await prisma.complianceIssue.create({
        data: {
          auditId: data.auditId,
          issue: data.issue,
          severity: data.severity,
          departmentId: data.departmentId,
          status: "Open",
        },
      });
      return NextResponse.json(newIssue, { status: 201 });
    }

    default:
      return NextResponse.json({ error: "Unsupported action." }, { status: 400 });
  }
}
