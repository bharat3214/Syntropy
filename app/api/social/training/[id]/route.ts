import { type NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

async function resolveDepartmentId(name: string): Promise<string | null> {
  const dept = await prisma.department.findFirst({ where: { name } });
  return dept?.id ?? null;
}

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
      include: { completions: { orderBy: { createdAt: "desc" } }, department: true },
    });
    if (!training) {
      return NextResponse.json({ error: "Training not found." }, { status: 404 });
    }
    return NextResponse.json({ ...training, department: training.department.name });
  } catch (error) {
    console.error("GET /api/social/training/[id] error:", error);
    return NextResponse.json({ error: "Failed to fetch training." }, { status: 500 });
  }
}

/**
 * PATCH /api/social/training/[id]
 * Update training program fields (commonly status).
 * Accepts `department` (name string) or `departmentId`.
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
          { error: `Invalid transition: ${existing.status} \u2192 ${body.status}. Allowed: ${allowed.join(", ") || "none"}` },
          { status: 400 }
        );
      }
    }

    let actualDepartmentId = body.departmentId;
    if (body.department && !actualDepartmentId) {
      const dept = await prisma.department.findFirst({ where: { name: body.department } });
      if (!dept) {
        return NextResponse.json({ error: `Department "${body.department}" not found.` }, { status: 400 });
      }
      actualDepartmentId = dept.id;
    }

    const updateData: Record<string, unknown> = {};
    if (body.title) updateData.title = body.title;
    if (body.description) updateData.description = body.description;
    if (body.category) updateData.category = body.category;
    if (actualDepartmentId) updateData.departmentId = actualDepartmentId;
    if (body.trainer) updateData.trainer = body.trainer;
    if (body.durationHours != null) updateData.durationHours = Number(body.durationHours);
    if (body.mandatory != null) updateData.mandatory = Boolean(body.mandatory);
    if (body.startDate) updateData.startDate = new Date(body.startDate);
    if (body.endDate) updateData.endDate = new Date(body.endDate);
    if (body.maxCapacity != null) updateData.maxCapacity = Number(body.maxCapacity);
    if (body.status) updateData.status = body.status;

    const updated = await prisma.trainingProgram.update({ where: { id }, data: updateData, include: { department: true } });
    return NextResponse.json({ ...updated, department: updated.department.name });
  } catch (error) {
    console.error("PATCH /api/social/training/[id] error:", error);
    return NextResponse.json({ error: "Failed to update training." }, { status: 500 });
  }
}
