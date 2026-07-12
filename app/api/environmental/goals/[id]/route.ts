import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { ok, badRequest, notFound, withErrorHandling } from "@/lib/api";
import { environmentalGoalUpdateSchema } from "@/validators/environmental";
import { calculateGoalProgress, deriveGoalStatus } from "@/lib/environmental/goals";

type Params = { params: Promise<{ id: string }> };

// GET /api/environmental/goals/[id]
export async function GET(_req: NextRequest, { params }: Params) {
  return withErrorHandling(async () => {
    const { id } = await params;

    const goal = await prisma.environmentalGoal.findUnique({
      where: { id },
      include: { department: { select: { id: true, name: true, code: true } } },
    });
    if (!goal) return notFound("Environmental goal not found");

    const progress = calculateGoalProgress(goal.targetCo2Kg, goal.currentCo2Kg);
    const status = deriveGoalStatus(progress, goal.deadline, goal.status);

    return ok({ ...goal, progress, status });
  });
}

// PATCH /api/environmental/goals/[id]
export async function PATCH(req: NextRequest, { params }: Params) {
  return withErrorHandling(async () => {
    const { id } = await params;
    const body = await req.json();
    const parsed = environmentalGoalUpdateSchema.safeParse(body);

    if (!parsed.success) {
      return badRequest("Validation failed", parsed.error.flatten());
    }

    const existing = await prisma.environmentalGoal.findUnique({ where: { id } });
    if (!existing) return notFound("Environmental goal not found");

    const { departmentId, deadline, ...rest } = parsed.data;

    if (departmentId) {
      const department = await prisma.department.findUnique({
        where: { id: departmentId },
      });
      if (!department) return badRequest("Invalid departmentId");
    }

    const updated = await prisma.environmentalGoal.update({
      where: { id },
      data: {
        ...rest,
        ...(departmentId ? { departmentId } : {}),
        ...(deadline ? { deadline: new Date(deadline) } : {}),
      },
    });

    const progress = calculateGoalProgress(updated.targetCo2Kg, updated.currentCo2Kg);
    const status = deriveGoalStatus(progress, updated.deadline, updated.status);

    return ok({ ...updated, progress, status });
  });
}

// DELETE /api/environmental/goals/[id]
export async function DELETE(_req: NextRequest, { params }: Params) {
  return withErrorHandling(async () => {
    const { id } = await params;

    const existing = await prisma.environmentalGoal.findUnique({ where: { id } });
    if (!existing) return notFound("Environmental goal not found");

    await prisma.environmentalGoal.delete({ where: { id } });

    return ok({ id, deleted: true });
  });
}