import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET() {
  try {
    const [activities, participations, diversityMetrics, trainings, trainingCompletions] = await Promise.all([
      prisma.csrActivity.findMany({
        orderBy: { createdAt: "desc" },
        include: { _count: { select: { participations: true } }, department: true },
      }),
      prisma.employeeParticipation.findMany({
        orderBy: { registeredDate: "desc" },
        include: { activity: { select: { title: true } }, department: true, employee: true },
      }),
      prisma.diversityMetric.findMany({
        orderBy: [{ departmentId: "asc" }, { category: "asc" }],
        include: { department: true },
      }),
      prisma.trainingProgram.findMany({
        orderBy: { createdAt: "desc" },
        include: { _count: { select: { completions: true } }, department: true },
      }),
      prisma.trainingCompletion.findMany({
        orderBy: { createdAt: "desc" },
        include: { training: { select: { title: true } }, department: true, employee: true },
      }),
    ]);

    const activeActivities = activities.filter((a) => a.status === "Active").length;

    const approvedParticipations = participations.filter((p) => p.approvalStatus === "Approved").length;
    const pendingParticipations = participations.filter((p) => p.approvalStatus === "Pending").length;
    const rejectedParticipations = participations.filter((p) => p.approvalStatus === "Rejected").length;

    const participationApprovalRate =
      participations.length > 0
        ? Math.round((approvedParticipations / participations.length) * 1000) / 10
        : 0;

    const completedTrainings = trainingCompletions.filter((tc) => tc.status === "Completed").length;
    const trainingCompletionRate =
      trainingCompletions.length > 0
        ? Math.round((completedTrainings / trainingCompletions.length) * 1000) / 10
        : 0;

    const totalPointsAwarded = participations.reduce((sum, p) => sum + p.pointsEarned, 0);

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
      activities: activities.map((a) => ({ ...a, department: a.department.name })),
      participations: participations.map((p) => ({
        ...p,
        department: p.department.name,
        employeeName: `${p.employee?.firstName ?? ""} ${p.employee?.lastName ?? ""}`.trim(),
      })),
      diversityMetrics: diversityMetrics.map((d) => ({ ...d, department: d.department.name })),
      trainings: trainings.map((t) => ({ ...t, department: t.department.name })),
      trainingCompletions: trainingCompletions.map((tc) => ({
        ...tc,
        department: tc.department.name,
        employeeName: `${tc.employee?.firstName ?? ""} ${tc.employee?.lastName ?? ""}`.trim(),
      })),
      engagement,
    });
  } catch (error) {
    console.error("GET /api/social error:", error);
    return NextResponse.json({ error: "Failed to fetch social data." }, { status: 500 });
  }
}
