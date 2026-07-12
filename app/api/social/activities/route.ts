import { type NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

async function resolveDepartmentId(name: string): Promise<string | null> {
  const dept = await prisma.department.findFirst({ where: { name } });
  return dept?.id ?? null;
}

/**
 * GET /api/social/activities
 *
 * List all CSR activities with participation counts.
 * Supports query params: ?status=Active&departmentId=...&department=...&category=Environment
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

    const activities = await prisma.csrActivity.findMany({
      where,
      orderBy: { createdAt: "desc" },
      include: {
        _count: { select: { participations: true } },
        department: true,
      },
    });

    return NextResponse.json({
      activities: activities.map((a) => ({ ...a, department: a.department.name })),
    });
  } catch (error) {
    console.error("GET /api/social/activities error:", error);
    return NextResponse.json(
      { error: "Failed to fetch activities." },
      { status: 500 }
    );
  }
}

/**
 * POST /api/social/activities
 *
 * Create a new CSR activity.
 * Accepts `department` (name string) or `departmentId`.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const {
      title,
      description,
      category,
      departmentId,
      department,
      location,
      date,
      durationHours,
      maxParticipants,
      organizer,
      status,
    } = body;

    let actualDepartmentId = departmentId;
    if (department && !actualDepartmentId) {
      const dept = await prisma.department.findFirst({ where: { name: department } });
      if (!dept) {
        return NextResponse.json({ error: `Department "${department}" not found.` }, { status: 400 });
      }
      actualDepartmentId = dept.id;
    }

    // Validate required fields
    if (
      !title ||
      !description ||
      !category ||
      !actualDepartmentId ||
      !location ||
      !date ||
      durationHours == null ||
      maxParticipants == null ||
      !organizer
    ) {
      return NextResponse.json(
        {
          error: "Missing required fields.",
          required: [
            "title",
            "description",
            "category",
            "departmentId or department",
            "location",
            "date",
            "durationHours",
            "maxParticipants",
            "organizer",
          ],
        },
        { status: 400 }
      );
    }

    const activity = await prisma.csrActivity.create({
      data: {
        title,
        description,
        category,
        departmentId: actualDepartmentId,
        location,
        date: new Date(date),
        durationHours: Number(durationHours),
        maxParticipants: Number(maxParticipants),
        organizer,
        status: status || "Draft",
      },
      include: { department: true },
    });

    return NextResponse.json({ ...activity, department: activity.department.name }, { status: 201 });
  } catch (error) {
    console.error("POST /api/social/activities error:", error);
    return NextResponse.json(
      { error: "Failed to create activity." },
      { status: 500 }
    );
  }
}
