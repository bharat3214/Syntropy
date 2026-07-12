import { type NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

/**
 * GET /api/social/training/completions
 * List all training completions. Supports ?trainingId=&status=&departmentId=
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;
    const trainingId = searchParams.get("trainingId");
    const status = searchParams.get("status");
    const departmentId = searchParams.get("departmentId");

    const where: Record<string, string> = {};
    if (trainingId) where.trainingId = trainingId;
    if (status) where.status = status;
    if (departmentId) where.departmentId = departmentId;

    const completions = await prisma.trainingCompletion.findMany({
      where,
      orderBy: { createdAt: "desc" },
      include: { training: { select: { title: true, category: true } } },
    });

    return NextResponse.json({ completions });
  } catch (error) {
    console.error("GET /api/social/training/completions error:", error);
    return NextResponse.json({ error: "Failed to fetch completions." }, { status: 500 });
  }
}

/**
 * POST /api/social/training/completions
 * Record a training completion for an employee.
 * Enforces: training exists, no duplicate completions.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { trainingId, employeeId, departmentId, score, status, certificateUrl } = body;

    if (!trainingId || !employeeId || !departmentId) {
      return NextResponse.json(
        { error: "Missing required fields.", required: ["trainingId", "employeeId", "departmentId"] },
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
      where: { trainingId_employeeId: { trainingId, employeeId } },
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
        employeeId,
        departmentId,
        score: score != null ? Number(score) : null,
        status: completionStatus,
        completionDate: completionStatus === "Completed" ? new Date() : null,
        certificateUrl: certificateUrl || null,
      },
      include: { training: { select: { title: true } } },
    });

    return NextResponse.json(completion, { status: 201 });
  } catch (error) {
    console.error("POST /api/social/training/completions error:", error);
    return NextResponse.json({ error: "Failed to record completion." }, { status: 500 });
  }
}
