import { type NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

/**
 * GET /api/social/activities
 *
 * List all CSR activities with participation counts.
 * Supports query params: ?status=Active&departmentId=...&category=Environment
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

    const activities = await prisma.csrActivity.findMany({
      where,
      orderBy: { createdAt: "desc" },
      include: {
        _count: { select: { participations: true } },
      },
    });

    return NextResponse.json({ activities });
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
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const {
      title,
      description,
      category,
      departmentId,
      location,
      date,
      durationHours,
      maxParticipants,
      organizer,
      status,
    } = body;

    // Validate required fields
    if (
      !title ||
      !description ||
      !category ||
      !departmentId ||
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
            "departmentId",
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
        departmentId,
        location,
        date: new Date(date),
        durationHours: Number(durationHours),
        maxParticipants: Number(maxParticipants),
        organizer,
        status: status || "Draft",
      },
    });

    return NextResponse.json(activity, { status: 201 });
  } catch (error) {
    console.error("POST /api/social/activities error:", error);
    return NextResponse.json(
      { error: "Failed to create activity." },
      { status: 500 }
    );
  }
}
