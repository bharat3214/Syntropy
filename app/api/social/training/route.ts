import { type NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

/**
 * GET /api/social/training
 * List all training programs. Supports ?status=&departmentId=&category=
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;
    const status = searchParams.get("status");
    const departmentId = searchParams.get("departmentId");
    const category = searchParams.get("category");

    const where: Record<string, string> = {};
    if (status) where.status = status;
    if (departmentId) where.departmentId = departmentId;
    if (category) where.category = category;

    const trainings = await prisma.trainingProgram.findMany({
      where,
      orderBy: { createdAt: "desc" },
      include: { _count: { select: { completions: true } } },
    });

    return NextResponse.json({ trainings });
  } catch (error) {
    console.error("GET /api/social/training error:", error);
    return NextResponse.json({ error: "Failed to fetch trainings." }, { status: 500 });
  }
}

/**
 * POST /api/social/training
 * Create a new training program.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      title, description, category, departmentId, trainer,
      durationHours, mandatory, startDate, endDate, maxCapacity, status,
    } = body;

    if (!title || !description || !category || !departmentId || !trainer ||
        durationHours == null || !startDate || !endDate || maxCapacity == null) {
      return NextResponse.json(
        {
          error: "Missing required fields.",
          required: ["title", "description", "category", "departmentId", "trainer",
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
        departmentId,
        trainer,
        durationHours: Number(durationHours),
        mandatory: Boolean(mandatory),
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        maxCapacity: Number(maxCapacity),
        status: status || "Scheduled",
      },
    });

    return NextResponse.json(training, { status: 201 });
  } catch (error) {
    console.error("POST /api/social/training error:", error);
    return NextResponse.json({ error: "Failed to create training." }, { status: 500 });
  }
}
