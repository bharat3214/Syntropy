import { type NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

/**
 * GET /api/social/training/[id]
 * Get a single training program with all completions.
 */
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const training = await prisma.trainingProgram.findUnique({
      where: { id },
      include: { completions: { orderBy: { createdAt: "desc" } } },
    });
    if (!training) {
      return NextResponse.json({ error: "Training not found." }, { status: 404 });
    }
    return NextResponse.json(training);
  } catch (error) {
    console.error("GET /api/social/training/[id] error:", error);
    return NextResponse.json({ error: "Failed to fetch training." }, { status: 500 });
  }
}

/**
 * PATCH /api/social/training/[id]
 * Update training program fields (commonly status).
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    const existing = await prisma.trainingProgram.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: "Training not found." }, { status: 404 });
    }

    if (body.status) {
      const validTransitions: Record<string, string[]> = {
        Scheduled: ["In Progress", "Cancelled"],
        "In Progress": ["Completed", "Cancelled"],
        Completed: [],
        Cancelled: [],
      };
      const allowed = validTransitions[existing.status] || [];
      if (!allowed.includes(body.status)) {
        return NextResponse.json(
          { error: `Invalid transition: ${existing.status} → ${body.status}. Allowed: ${allowed.join(", ") || "none"}` },
          { status: 400 }
        );
      }
    }

    const updateData: Record<string, unknown> = {};
    if (body.title) updateData.title = body.title;
    if (body.description) updateData.description = body.description;
    if (body.category) updateData.category = body.category;
    if (body.departmentId) updateData.departmentId = body.departmentId;
    if (body.trainer) updateData.trainer = body.trainer;
    if (body.durationHours != null) updateData.durationHours = Number(body.durationHours);
    if (body.mandatory != null) updateData.mandatory = Boolean(body.mandatory);
    if (body.startDate) updateData.startDate = new Date(body.startDate);
    if (body.endDate) updateData.endDate = new Date(body.endDate);
    if (body.maxCapacity != null) updateData.maxCapacity = Number(body.maxCapacity);
    if (body.status) updateData.status = body.status;

    const updated = await prisma.trainingProgram.update({ where: { id }, data: updateData });
    return NextResponse.json(updated);
  } catch (error) {
    console.error("PATCH /api/social/training/[id] error:", error);
    return NextResponse.json({ error: "Failed to update training." }, { status: 500 });
  }
}
