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
 * GET /api/social/participation
 * List all participations. Supports ?activityId=&status=&departmentId=&department=
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;
    const activityId = searchParams.get("activityId");
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
    if (activityId) where.activityId = activityId;
    if (status) where.approvalStatus = status;
    if (actualDepartmentId) where.departmentId = actualDepartmentId;

    const participations = await prisma.employeeParticipation.findMany({
      where,
      orderBy: { registeredDate: "desc" },
      include: { activity: { select: { title: true, category: true } }, department: true, employee: true },
    });

    return NextResponse.json({
      participations: participations.map((p) => ({
        ...p,
        department: p.department.name,
        employeeName: `${p.employee.firstName ?? ""} ${p.employee.lastName ?? ""}`.trim(),
      })),
    });
  } catch (error) {
    console.error("GET /api/social/participation error:", error);
    return NextResponse.json({ error: "Failed to fetch participations." }, { status: 500 });
  }
}

/**
 * POST /api/social/participation
 * Register an employee for a CSR activity.
 * Accepts `department` (name string) or `departmentId`, and `employeeName` or `employeeId`.
 * Enforces: activity exists, is Active, capacity check, no duplicates.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { activityId, employeeId, employeeName, departmentId, department, proof } = body;

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

    if (!activityId || !actualEmployeeId || !actualDepartmentId) {
      return NextResponse.json(
        { error: "Missing required fields.", required: ["activityId", "employeeId or employeeName", "departmentId or department"] },
        { status: 400 }
      );
    }

    // Validate activity exists and is Active
    const activity = await prisma.csrActivity.findUnique({
      where: { id: activityId },
      include: { _count: { select: { participations: true } } },
    });

    if (!activity) {
      return NextResponse.json({ error: "Activity not found." }, { status: 404 });
    }

    if (activity.status !== "Active") {
      return NextResponse.json(
        { error: `Cannot register for activity with status "${activity.status}". Activity must be Active.` },
        { status: 400 }
      );
    }

    // Capacity check
    if (activity._count.participations >= activity.maxParticipants) {
      return NextResponse.json(
        { error: "Activity has reached maximum capacity." },
        { status: 409 }
      );
    }

    // Duplicate check (also enforced by DB unique constraint)
    const existing = await prisma.employeeParticipation.findUnique({
      where: { activityId_employeeId: { activityId, employeeId: actualEmployeeId } },
    });
    if (existing) {
      return NextResponse.json(
        { error: "Employee is already registered for this activity." },
        { status: 409 }
      );
    }

    const participation = await prisma.employeeParticipation.create({
      data: {
        activityId,
        employeeId: actualEmployeeId,
        departmentId: actualDepartmentId,
        proof: proof || null,
      },
      include: { activity: { select: { title: true } }, department: true, employee: true },
    });

    return NextResponse.json({
      ...participation,
      department: participation.department.name,
      employeeName: `${participation.employee.firstName ?? ""} ${participation.employee.lastName ?? ""}`.trim(),
    }, { status: 201 });
  } catch (error) {
    console.error("POST /api/social/participation error:", error);
    return NextResponse.json({ error: "Failed to register participation." }, { status: 500 });
  }
}
