import { type NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

/**
 * GET /api/social/export?type=activities|participation|training
 * Export social module data as CSV.
 */
export async function GET(request: NextRequest) {
  try {
    const type = request.nextUrl.searchParams.get("type");

    if (!type || !["activities", "participation", "training"].includes(type)) {
      return NextResponse.json(
        { error: 'Query param "type" required. Must be: activities, participation, or training.' },
        { status: 400 }
      );
    }

    let csv = "";

    if (type === "activities") {
      const activities = await prisma.csrActivity.findMany({
        orderBy: { date: "desc" },
        include: {
          _count: { select: { participations: true } },
          department: true,
        },
      });

      const headers = ["ID", "Title", "Category", "Department", "Location", "Date", "Duration (hrs)", "Max Participants", "Current Participants", "Status", "Organizer"];
      const rows = activities.map((a) => [
        a.id, a.title, a.category, a.department.name, a.location,
        a.date.toISOString().split("T")[0], a.durationHours, a.maxParticipants,
        a._count.participations, a.status, a.organizer,
      ]);

      csv = [headers.join(","), ...rows.map((r) => r.map((v) => `"${String(v).replace(/"/g, '""')}"`).join(","))].join("\n");
    }

    if (type === "participation") {
      const participations = await prisma.employeeParticipation.findMany({
        orderBy: { registeredDate: "desc" },
        include: {
          activity: { select: { title: true } },
          department: true,
          employee: true,
        },
      });

      const headers = ["ID", "Activity", "Employee Name", "Employee ID", "Department", "Status", "Points Earned", "Proof", "Registered Date", "Completion Date", "Reviewed By"];
      const rows = participations.map((p) => [
        p.id, p.activity.title, `${p.employee.firstName} ${p.employee.lastName}`, p.employeeId, p.department.name,
        p.approvalStatus, p.pointsEarned, p.proof || "", p.registeredDate.toISOString().split("T")[0],
        p.completionDate?.toISOString().split("T")[0] || "", p.reviewedBy || "",
      ]);

      csv = [headers.join(","), ...rows.map((r) => r.map((v) => `"${String(v).replace(/"/g, '""')}"`).join(","))].join("\n");
    }

    if (type === "training") {
      const completions = await prisma.trainingCompletion.findMany({
        orderBy: { createdAt: "desc" },
        include: {
          training: { select: { title: true } },
          department: true,
          employee: true,
        },
      });

      const headers = ["ID", "Training", "Employee Name", "Employee ID", "Department", "Status", "Score", "Completion Date", "Certificate URL"];
      const rows = completions.map((c) => [
        c.id, c.training.title, `${c.employee.firstName} ${c.employee.lastName}`, c.employeeId, c.department.name,
        c.status, c.score ?? "", c.completionDate?.toISOString().split("T")[0] || "", c.certificateUrl || "",
      ]);

      csv = [headers.join(","), ...rows.map((r) => r.map((v) => `"${String(v).replace(/"/g, '""')}"`).join(","))].join("\n");
    }

    return new Response(csv, {
      status: 200,
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="social-${type}-export.csv"`,
      },
    });
  } catch (error) {
    console.error("GET /api/social/export error:", error);
    return NextResponse.json({ error: "Failed to export data." }, { status: 500 });
  }
}
