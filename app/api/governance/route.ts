import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET() {
  const [policiesRaw, acknowledgementsRaw, complianceIssuesRaw, auditsRaw] = await Promise.all([
    prisma.policy.findMany({ include: { department: true } }),
    prisma.policyAcknowledgement.findMany({ include: { policy: { include: { department: true } }, employee: true } }),
    prisma.complianceIssue.findMany({ include: { department: true } }),
    prisma.audit.findMany({ include: { complianceIssues: { include: { department: true } }, department: true } }),
  ]);

  const policies = policiesRaw.map((p) => ({
    id: p.id,
    title: p.title,
    department: p.department.name,
    description: p.description,
    status: p.status,
    version: p.version,
    effectiveDate: p.effectiveDate.toISOString(),
  }));

  const acknowledgements = acknowledgementsRaw.map((a) => ({
    id: a.id,
    policyId: a.policyId,
    employeeName: `${a.employee.firstName ?? ""} ${a.employee.lastName ?? ""}`.trim() || a.employeeId,
    department: a.policy.department.name,
    status: a.status,
    dateSigned: a.dateSigned?.toISOString() ?? null,
  }));

  const audits = auditsRaw.map((au) => ({
    id: au.id,
    title: au.title,
    department: au.department.name,
    auditor: au.auditor,
    date: au.date.toISOString(),
    findings: au.findings,
    status: au.status,
    complianceIssues: au.complianceIssues.map((ci) => ({
      id: ci.id,
      auditId: ci.auditId,
      issue: ci.issue,
      severity: ci.severity,
      department: ci.department.name,
      status: ci.status,
    })),
  }));

  const complianceIssues = complianceIssuesRaw.map((ci) => ({
    id: ci.id,
    auditId: ci.auditId,
    issue: ci.issue,
    severity: ci.severity,
    department: ci.department.name,
    status: ci.status,
  }));

  const totalIssues = complianceIssues.length;
  const resolvedIssues = complianceIssues.filter((c) => c.status === "Resolved").length;
  const complianceScore = totalIssues > 0 ? (resolvedIssues / totalIssues) * 100 : 100;
  const totalOpenIssues = complianceIssues.filter((c) => c.status === "Open" || c.status === "In Progress").length;

  const deptSet = new Set<string>();
  for (const p of policies) deptSet.add(p.department);
  for (const a of acknowledgements) deptSet.add(a.department);
  for (const au of audits) deptSet.add(au.department);
  for (const c of complianceIssues) deptSet.add(c.department);

  const departmentLeaderboard = Array.from(deptSet)
    .map((dept) => {
      const unresolvedCount = complianceIssues.filter((c) => c.department === dept && (c.status === "Open" || c.status === "In Progress")).length;
      return { department: dept, unresolvedCount };
    })
    .sort((a, b) => a.unresolvedCount - b.unresolvedCount);

  return NextResponse.json(
    { policies, acknowledgements, audits, complianceIssues, analytics: { complianceScore, totalOpenIssues, departmentLeaderboard } },
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

  async function resolveDept(name: string): Promise<string | null> {
    if (!name) return null;
    const dept = await prisma.department.findFirst({ where: { name } });
    return dept?.id ?? null;
  }

  switch (action) {
    case "CREATE_AUDIT": {
      if (!data.title || !data.auditor || !data.date || !data.findings || !data.status) {
        return NextResponse.json({ error: "Missing required fields." }, { status: 400 });
      }
      const deptField = data.departmentId || data.department;
      if (!deptField) {
        return NextResponse.json({ error: "Missing required field: department" }, { status: 400 });
      }
      const departmentId = await resolveDept(deptField);
      if (!departmentId) {
        return NextResponse.json({ error: `Department "${deptField}" not found` }, { status: 400 });
      }
      const newAudit = await prisma.audit.create({
        data: { title: data.title, departmentId, auditor: data.auditor, date: new Date(data.date), findings: data.findings, status: data.status },
      });
      return NextResponse.json(newAudit, { status: 201 });
    }

    case "EXPORT_AUDITS": {
      const auditsRaw = await prisma.audit.findMany({ include: { department: true } });
      const headers = ["id", "title", "department", "auditor", "date", "findings", "status"];
      const rows = auditsRaw.map((au) =>
        [au.id, au.title, au.department.name, au.auditor, au.date.toISOString(), au.findings, au.status]
          .map((val) => `"${String(val).replace(/"/g, '""')}"`).join(",")
      );
      return NextResponse.json({ csv: [headers.join(","), ...rows].join("\n") }, { status: 200 });
    }

    case "ACKNOWLEDGE_POLICY": {
      const ack = await prisma.policyAcknowledgement.findUnique({ where: { id: data.acknowledgementId } });
      if (!ack) return NextResponse.json({ error: "Not found." }, { status: 404 });
      const updatedAck = await prisma.policyAcknowledgement.update({
        where: { id: data.acknowledgementId },
        data: { status: "Acknowledged", dateSigned: new Date() },
      });
      return NextResponse.json(updatedAck, { status: 200 });
    }

    case "RESOLVE_COMPLIANCE": {
      const issue = await prisma.complianceIssue.findUnique({ where: { id: data.issueId } });
      if (!issue) return NextResponse.json({ error: "Not found." }, { status: 404 });
      const updatedIssue = await prisma.complianceIssue.update({ where: { id: data.issueId }, data: { status: "Resolved" } });
      return NextResponse.json(updatedIssue, { status: 200 });
    }

    case "RAISE_COMPLIANCE": {
      if (!data.auditId || !data.issue || !data.severity) {
        return NextResponse.json({ error: "Missing required fields." }, { status: 400 });
      }
      const deptField = data.departmentId || data.department;
      if (!deptField) {
        return NextResponse.json({ error: "Missing required field: department" }, { status: 400 });
      }
      const audit = await prisma.audit.findUnique({ where: { id: data.auditId } });
      if (!audit) return NextResponse.json({ error: "Referenced audit not found." }, { status: 404 });
      const departmentId = await resolveDept(deptField);
      if (!departmentId) return NextResponse.json({ error: `Department "${deptField}" not found` }, { status: 400 });
      const newIssue = await prisma.complianceIssue.create({
        data: { auditId: data.auditId, issue: data.issue, severity: data.severity, departmentId, status: "Open" },
      });
      return NextResponse.json(newIssue, { status: 201 });
    }

    default:
      return NextResponse.json({ error: "Unsupported action." }, { status: 400 });
  }
}
