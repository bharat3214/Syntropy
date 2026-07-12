import { type NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

async function resolveDepartmentId(name: string): Promise<string | null> {
  const dept = await prisma.department.findFirst({ where: { name } });
  return dept?.id ?? null;
}

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const activity = await prisma.csrActivity.findUnique({
      where: { id },
      include: { participations: { orderBy: { registeredDate: "desc" } }, department: true },
    });
    if (!activity) {
      return NextResponse.json({ error: "Activity not found." }, { status: 404 });
    }
    return NextResponse.json({ ...activity, department: activity.department.name });
  } catch (error) {
    console.error("GET /api/social/activities/[id] error:", error);
    return NextResponse.json({ error: "Failed to fetch activity." }, { status: 500 });
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const existing = await prisma.csrActivity.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: "Activity not found." }, { status: 404 });
    }

    if (body.status) {
      const validTransitions: Record<string, string[]> = {
        Draft: ["Active", "Cancelled"],
        Active: ["Completed", "Cancelled"],
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
    if (body.location) updateData.location = body.location;
    if (body.date) updateData.date = new Date(body.date);
    if (body.durationHours != null) updateData.durationHours = Number(body.durationHours);
    if (body.maxParticipants != null) updateData.maxParticipants = Number(body.maxParticipants);
    if (body.organizer) updateData.organizer = body.organizer;
    if (body.status) updateData.status = body.status;

    const updated = await prisma.csrActivity.update({ where: { id }, data: updateData, include: { department: true } });
    return NextResponse.json({ ...updated, department: updated.department.name });
  } catch (error) {
    console.error("PATCH /api/social/activities/[id] error:", error);
    return NextResponse.json({ error: "Failed to update activity." }, { status: 500 });
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const existing = await prisma.csrActivity.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: "Activity not found." }, { status: 404 });
    }
    await prisma.csrActivity.delete({ where: { id } });
    return NextResponse.json({ message: "Activity deleted." });
  } catch (error) {
    console.error("DELETE /api/social/activities/[id] error:", error);
    return NextResponse.json({ error: "Failed to delete activity." }, { status: 500 });
  }
}
