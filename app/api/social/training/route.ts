import { type NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

async function resolveDepartmentId(name: string): Promise<string | null> {
  const dept = await prisma.department.findFirst({ where: { name } });
  return dept?.id ?? null;
}

/**
 * GET /api/social/training
 * List all training programs. Supports ?status=&departmentId=&department=&category=
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;
    const status = searchParams.get("status");
    const departmentId = searchParams.get("departmentId");
    const department = searchParams.get("department");
    const category = searchParams.get("category");

    let actualDepartmentId = departmentId || undefined;
    if (department) {
      const dept = await prisma.department.findFirst({ where: { name: department } });
      if (!dept) {
        return NextResponse.json({ error: `Department "${department}" not found.` }, { status: 400 });
      }
      actualDepartmentId = dept.id;
    }

    const where: Record<string, string> = {};
    if (status) where.status = status;
    if (actualDepartmentId) where.departmentId = actualDepartmentId;
    if (category) where.category = category;

    const trainings = await prisma.trainingProgram.findMany({
      where,
      orderBy: { createdAt: "desc" },
      include: { _count: { select: { completions: true } }, department: true },
    });

    return NextResponse.json({
      trainings: trainings.map((t) => ({ ...t, department: t.department.name })),
    });
  } catch (error) {
    console.error("GET /api/social/training error:", error);
    return NextResponse.json({ error: "Failed to fetch trainings." }, { status: 500 });
  }
}

/**
 * POST /api/social/training
 * Create a new training program.
 * Accepts `department` (name string) or `departmentId`.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      title, description, category, departmentId, department, trainer,
      durationHours, mandatory, startDate, endDate, maxCapacity, status,
    } = body;

    let actualDepartmentId = departmentId;
    if (department && !actualDepartmentId) {
      const dept = await prisma.department.findFirst({ where: { name: department } });
      if (!dept) {
        return NextResponse.json({ error: `Department "${department}" not found.` }, { status: 400 });
      }
      actualDepartmentId = dept.id;
    }

    if (!title || !description || !category || !actualDepartmentId || !trainer ||
        durationHours == null || !startDate || !endDate || maxCapacity == null) {
      return NextResponse.json(
        {
          error: "Missing required fields.",
          required: ["title", "description", "category", "departmentId or department", "trainer",
                     "durationHours", "startDate", "endDate", "maxCapacity"],
        },
        { status: 400 }
      );
    }

    const training = await prisma.trainingProgram.create({
      data: {
        title,
        description,
        category,
        departmentId: actualDepartmentId,
        trainer,
        durationHours: Number(durationHours),
        mandatory: Boolean(mandatory),
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        maxCapacity: Number(maxCapacity),
        status: status || "Scheduled",
      },
      include: { department: true },
    });

    return NextResponse.json({ ...training, department: training.department.name }, { status: 201 });
  } catch (error) {
    console.error("POST /api/social/training error:", error);
    return NextResponse.json({ error: "Failed to create training." }, { status: 500 });
  }
}
