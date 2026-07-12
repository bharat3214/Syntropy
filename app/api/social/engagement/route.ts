import { NextResponse } from "next/server";
import { prisma } from "@/utils/prisma";

/**
 * GET /api/social/engagement
 * Returns computed engagement analytics — no stored data, all derived from existing tables.
 */
export async function GET() {
  try {
    const [
      activities,
      participations,
      trainingCompletions,
      trainings,
    ] = await Promise.all([
      prisma.csrActivity.findMany({ select: { id: true, status: true, category: true } }),
      prisma.employeeParticipation.findMany({
        select: {
          department: true,
          approvalStatus: true,
          pointsEarned: true,
          registeredDate: true,
          activity: { select: { category: true } },
        },
      }),
      prisma.trainingCompletion.findMany({
        select: {
          department: true,
          status: true,
          createdAt: true,
          training: { select: { category: true } },
        },
      }),
      prisma.trainingProgram.findMany({ select: { id: true, status: true, category: true } }),
    ]);

    // ── Overview ──────────────────────────────────────────────────────────────
    const approved = participations.filter((p) => p.approvalStatus === "Approved").length;
    const completedTC = trainingCompletions.filter((tc) => tc.status === "Completed").length;

    const overview = {
      totalActivities: activities.length,
      activeActivities: activities.filter((a) => a.status === "Active").length,
      totalParticipations: participations.length,
      approvedParticipations: approved,
      pendingParticipations: participations.filter((p) => p.approvalStatus === "Pending").length,
      participationApprovalRate: participations.length > 0
        ? Math.round((approved / participations.length) * 1000) / 10 : 0,
      totalTrainings: trainings.length,
      completedTrainingRecords: completedTC,
      trainingCompletionRate: trainingCompletions.length > 0
        ? Math.round((completedTC / trainingCompletions.length) * 1000) / 10 : 0,
      totalPointsAwarded: participations.reduce((s, p) => s + p.pointsEarned, 0),
    };

    // ── Department engagement ─────────────────────────────────────────────────
    const deptMap = new Map<string, { participations: number; trainingsCompleted: number; pointsEarned: number }>();

    for (const p of participations) {
      const entry = deptMap.get(p.department) || { participations: 0, trainingsCompleted: 0, pointsEarned: 0 };
      entry.participations++;
      entry.pointsEarned += p.pointsEarned;
      deptMap.set(p.department, entry);
    }
    for (const tc of trainingCompletions) {
      if (tc.status === "Completed") {
        const entry = deptMap.get(tc.department) || { participations: 0, trainingsCompleted: 0, pointsEarned: 0 };
        entry.trainingsCompleted++;
        deptMap.set(tc.department, entry);
      }
    }

    const departmentEngagement = Array.from(deptMap.entries())
      .map(([department, data]) => ({ department, ...data }))
      .sort((a, b) => b.pointsEarned - a.pointsEarned);

    // ── Monthly trend ─────────────────────────────────────────────────────────
    const monthMap = new Map<string, { participations: number; trainingsCompleted: number }>();

    for (const p of participations) {
      const month = p.registeredDate.toISOString().slice(0, 7);
      const entry = monthMap.get(month) || { participations: 0, trainingsCompleted: 0 };
      entry.participations++;
      monthMap.set(month, entry);
    }
    for (const tc of trainingCompletions) {
      if (tc.status === "Completed") {
        const month = tc.createdAt.toISOString().slice(0, 7);
        const entry = monthMap.get(month) || { participations: 0, trainingsCompleted: 0 };
        entry.trainingsCompleted++;
        monthMap.set(month, entry);
      }
    }

    const monthlyTrend = Array.from(monthMap.entries())
      .map(([month, data]) => ({ month, ...data }))
      .sort((a, b) => a.month.localeCompare(b.month));

    // ── Category breakdown ────────────────────────────────────────────────────
    const actCats: Record<string, number> = {};
    for (const a of activities) {
      actCats[a.category] = (actCats[a.category] || 0) + 1;
    }
    const trnCats: Record<string, number> = {};
    for (const t of trainings) {
      trnCats[t.category] = (trnCats[t.category] || 0) + 1;
    }

    return NextResponse.json({
      overview,
      departmentEngagement,
      monthlyTrend,
      categoryBreakdown: { activities: actCats, trainings: trnCats },
    });
  } catch (error) {
    console.error("GET /api/social/engagement error:", error);
    return NextResponse.json({ error: "Failed to compute engagement." }, { status: 500 });
  }
}
