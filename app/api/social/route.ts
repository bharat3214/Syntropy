import { NextResponse } from "next/server";
import { prisma } from "@/utils/prisma";

/**
 * GET /api/social
 *
 * Returns a high-level summary of all social module data.
 * Acts as the "dashboard data" endpoint for the Social module.
 */
export async function GET() {
  try {
    const [
      activities,
      participations,
      diversityMetrics,
      trainings,
      trainingCompletions,
    ] = await Promise.all([
      prisma.csrActivity.findMany({
        orderBy: { createdAt: "desc" },
        include: { _count: { select: { participations: true } } },
      }),
      prisma.employeeParticipation.findMany({
        orderBy: { registeredDate: "desc" },
        include: { activity: { select: { title: true } } },
      }),
      prisma.diversityMetric.findMany({
        orderBy: [{ department: "asc" }, { category: "asc" }],
      }),
      prisma.trainingProgram.findMany({
        orderBy: { createdAt: "desc" },
        include: { _count: { select: { completions: true } } },
      }),
      prisma.trainingCompletion.findMany({
        orderBy: { createdAt: "desc" },
        include: { training: { select: { title: true } } },
      }),
    ]);

    // ── Compute engagement summary ────────────────────────────────────────────

    const activeActivities = activities.filter(
      (a) => a.status === "Active"
    ).length;

    const approvedParticipations = participations.filter(
      (p) => p.approvalStatus === "Approved"
    ).length;
    const pendingParticipations = participations.filter(
      (p) => p.approvalStatus === "Pending"
    ).length;
    const rejectedParticipations = participations.filter(
      (p) => p.approvalStatus === "Rejected"
    ).length;

    const participationApprovalRate =
      participations.length > 0
        ? Math.round((approvedParticipations / participations.length) * 1000) /
          10
        : 0;

    const completedTrainings = trainingCompletions.filter(
      (tc) => tc.status === "Completed"
    ).length;
    const trainingCompletionRate =
      trainingCompletions.length > 0
        ? Math.round(
            (completedTrainings / trainingCompletions.length) * 1000
          ) / 10
        : 0;

    const totalPointsAwarded = participations.reduce(
      (sum, p) => sum + p.pointsEarned,
      0
    );

    const engagement = {
      totalActivities: activities.length,
      activeActivities,
      totalParticipations: participations.length,
      approvedParticipations,
      pendingParticipations,
      rejectedParticipations,
      participationApprovalRate,
      totalTrainings: trainings.length,
      completedTrainingRecords: completedTrainings,
      trainingCompletionRate,
      totalPointsAwarded,
    };

    return NextResponse.json({
      activities,
      participations,
      diversityMetrics,
      trainings,
      trainingCompletions,
      engagement,
    });
  } catch (error) {
    console.error("GET /api/social error:", error);
    return NextResponse.json(
      { error: "Failed to fetch social data." },
      { status: 500 }
    );
  }
}
