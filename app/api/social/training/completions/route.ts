import { type NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

async function resolveDepartmentId(name: string): Promise<string | null> {
  const dept = await prisma.department.findFirst({ where: { name } });
  return dept?.id ?? null;
}

async function resolveEmployeeId(name: string): Promise<string | null> {
  const parts = name.split(" ");
  const firstName = parts[0];
  const lastName = parts.slice(1).join(" ");
  const emp = await prisma.employee.findFirst({
    where: { firstName, lastName },
  });
  return emp?.id ?? null;
}

/**
 * GET /api/social/training/completions
 * List all training completions. Supports ?trainingId=&status=&departmentId=&department=
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;
    const trainingId = searchParams.get("trainingId");
    const status = searchParams.get("status");
    const departmentId = searchParams.get("departmentId");
    const department = searchParams.get("department");

    let actualDepartmentId = departmentId || undefined;
    if (department) {
      const dept = await prisma.department.findFirst({ where: { name: department } });
      if (!dept) {
        return NextResponse.json({ error: `Department "${department}" not found.` }, { status: 400 });
      }
      actualDepartmentId = dept.id;
    }

    const where: Record<string, string> = {};
    if (trainingId) where.trainingId = trainingId;
    if (status) where.status = status;
    if (actualDepartmentId) where.departmentId = actualDepartmentId;

    const completions = await prisma.trainingCompletion.findMany({
      where,
      orderBy: { createdAt: "desc" },
      include: { training: { select: { title: true, category: true } }, department: true, employee: true },
    });

    return NextResponse.json({
      completions: completions.map((c) => ({
        ...c,
        department: c.department.name,
        employeeName: `${c.employee.firstName ?? ""} ${c.employee.lastName ?? ""}`.trim(),
      })),
    });
  } catch (error) {
    console.error("GET /api/social/training/completions error:", error);
    return NextResponse.json({ error: "Failed to fetch completions." }, { status: 500 });
  }
}

/**
 * POST /api/social/training/completions
 * Record a training completion for an employee.
 * Accepts `department` (name string) or `departmentId`, and `employeeName` or `employeeId`.
 * Enforces: training exists, no duplicate completions.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { trainingId, employeeId, employeeName, departmentId, department, score, status, certificateUrl } = body;

    let actualDepartmentId = departmentId;
    if (department && !actualDepartmentId) {
      const dept = await prisma.department.findFirst({ where: { name: department } });
      if (!dept) {
        return NextResponse.json({ error: `Department "${department}" not found.` }, { status: 400 });
      }
      actualDepartmentId = dept.id;
    }

    let actualEmployeeId = employeeId;
    if (employeeName && !actualEmployeeId) {
      const empId = await resolveEmployeeId(employeeName);
      if (!empId) {
        return NextResponse.json({ error: `Employee "${employeeName}" not found.` }, { status: 400 });
      }
      actualEmployeeId = empId;
    }

    if (!trainingId || !actualEmployeeId || !actualDepartmentId) {
      return NextResponse.json(
        { error: "Missing required fields.", required: ["trainingId", "employeeId or employeeName", "departmentId or department"] },
        { status: 400 }
      );
    }

    // Validate training exists
    const training = await prisma.trainingProgram.findUnique({ where: { id: trainingId } });
    if (!training) {
      return NextResponse.json({ error: "Training program not found." }, { status: 404 });
    }

    // Duplicate check
    const existing = await prisma.trainingCompletion.findUnique({
      where: { trainingId_employeeId: { trainingId, employeeId: actualEmployeeId } },
    });
    if (existing) {
      return NextResponse.json(
        { error: "Employee already has a completion record for this training." },
        { status: 409 }
      );
    }

    const completionStatus = status || "Not Started";
    const completion = await prisma.trainingCompletion.create({
      data: {
        trainingId,
        employeeId: actualEmployeeId,
        departmentId: actualDepartmentId,
        score: score != null ? Number(score) : null,
        status: completionStatus,
        completionDate: completionStatus === "Completed" ? new Date() : null,
        certificateUrl: certificateUrl || null,
      },
      include: { training: { select: { title: true } }, department: true, employee: true },
    });

    return NextResponse.json({
      ...completion,
      department: completion.department.name,
      employeeName: `${completion.employee.firstName ?? ""} ${completion.employee.lastName ?? ""}`.trim(),
    }, { status: 201 });
  } catch (error) {
    console.error("POST /api/social/training/completions error:", error);
    return NextResponse.json({ error: "Failed to record completion." }, { status: 500 });
  }
}
