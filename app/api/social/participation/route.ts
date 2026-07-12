import { type NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

/**
 * GET /api/social/participation
 * List all participations. Supports ?activityId=&status=&department=
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;
    const activityId = searchParams.get("activityId");
    const status = searchParams.get("status");
    const department = searchParams.get("department");

    const where: Record<string, string> = {};
    if (activityId) where.activityId = activityId;
    if (status) where.approvalStatus = status;
    if (department) where.department = department;

    const participations = await prisma.employeeParticipation.findMany({
      where,
      orderBy: { registeredDate: "desc" },
      include: { activity: { select: { title: true, category: true } } },
    });

    return NextResponse.json({ participations });
  } catch (error) {
    console.error("GET /api/social/participation error:", error);
    return NextResponse.json({ error: "Failed to fetch participations." }, { status: 500 });
  }
}

/**
 * POST /api/social/participation
 * Register an employee for a CSR activity.
 * Enforces: activity exists, is Active, capacity check, no duplicates.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { activityId, employeeName, employeeId, department, proof } = body;

    if (!activityId || !employeeName || !employeeId || !department) {
      return NextResponse.json(
        { error: "Missing required fields.", required: ["activityId", "employeeName", "employeeId", "department"] },
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
      where: { activityId_employeeId: { activityId, employeeId } },
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
        employeeName,
        employeeId,
        department,
        proof: proof || null,
      },
      include: { activity: { select: { title: true } } },
    });

    return NextResponse.json(participation, { status: 201 });
  } catch (error) {
    console.error("POST /api/social/participation error:", error);
    return NextResponse.json({ error: "Failed to register participation." }, { status: 500 });
  }
}
