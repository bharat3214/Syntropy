import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { ok, created, badRequest, withErrorHandling } from "@/lib/api";
import { environmentalGoalCreateSchema } from "@/validators/environmental";
import { calculateGoalProgress, deriveGoalStatus } from "@/lib/environmental/goals";

// GET /api/environmental/goals
// Optional query params: ?departmentId=...&status=ACTIVE
// Each goal is returned with a computed `progress` field (0-100) and its
// `status` auto-derived from progress + deadline (unless ARCHIVED).
export async function GET(req: NextRequest) {
  return withErrorHandling(async () => {
    const { searchParams } = new URL(req.url);
    const departmentId = searchParams.get("departmentId");
    const status = searchParams.get("status");

    const goals = await prisma.environmentalGoal.findMany({
      where: {
        ...(departmentId ? { departmentId } : {}),
        ...(status
          ? { status: status as "ACTIVE" | "ON_TRACK" | "AT_RISK" | "COMPLETED" | "ARCHIVED" }
          : {}),
      },
      include: {
        department: { select: { id: true, name: true, code: true } },
      },
      orderBy: { deadline: "asc" },
    });

    const withProgress = goals.map((goal) => {
      const progress = calculateGoalProgress(goal.targetCo2Kg, goal.currentCo2Kg);
      const derivedStatus = deriveGoalStatus(progress, goal.deadline, goal.status);
      return { ...goal, progress, status: derivedStatus };
    });

    return ok(withProgress);
  });
}

// POST /api/environmental/goals
export async function POST(req: NextRequest) {
  return withErrorHandling(async () => {
    const body = await req.json();
    const parsed = environmentalGoalCreateSchema.safeParse(body);

    if (!parsed.success) {
      return badRequest("Validation failed", parsed.error.flatten());
    }

    const { departmentId, deadline, ...rest } = parsed.data;

    const department = await prisma.department.findUnique({
      where: { id: departmentId },
    });
    if (!department) return badRequest("Invalid departmentId");

    const goal = await prisma.environmentalGoal.create({
      data: {
        ...rest,
        departmentId,
        deadline: new Date(deadline),
      },
    });

    const progress = calculateGoalProgress(goal.targetCo2Kg, goal.currentCo2Kg);
    const status = deriveGoalStatus(progress, goal.deadline, goal.status);

    return created({ ...goal, progress, status });
  });
}