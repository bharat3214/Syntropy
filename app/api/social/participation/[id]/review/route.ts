import { type NextRequest, NextResponse } from "next/server";
import { prisma } from "@/utils/prisma";

/**
 * POST /api/social/participation/[id]/review
 * Approve or reject a participation.
 * Body: { decision: "Approved"|"Rejected", reviewedBy, pointsEarned?, reason? }
 * Evidence requirement: approval requires proof to be attached.
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { decision, reviewedBy, pointsEarned, reason } = body;

    if (!decision || !reviewedBy) {
      return NextResponse.json(
        { error: "Missing required fields.", required: ["decision", "reviewedBy"] },
        { status: 400 }
      );
    }

    if (!["Approved", "Rejected"].includes(decision)) {
      return NextResponse.json(
        { error: 'Decision must be "Approved" or "Rejected".' },
        { status: 400 }
      );
    }

    const participation = await prisma.employeeParticipation.findUnique({
      where: { id },
    });

    if (!participation) {
      return NextResponse.json({ error: "Participation not found." }, { status: 404 });
    }

    if (participation.approvalStatus !== "Pending") {
      return NextResponse.json(
        { error: `Participation already ${participation.approvalStatus.toLowerCase()}.` },
        { status: 400 }
      );
    }

    // Evidence requirement for approval
    if (decision === "Approved" && !participation.proof) {
      return NextResponse.json(
        { error: "Cannot approve participation without proof. Employee must attach evidence first." },
        { status: 400 }
      );
    }

    const updated = await prisma.employeeParticipation.update({
      where: { id },
      data: {
        approvalStatus: decision,
        reviewedBy,
        reviewedDate: new Date(),
        pointsEarned: decision === "Approved" ? (pointsEarned || 0) : 0,
        completionDate: decision === "Approved" ? new Date() : null,
        rejectionReason: decision === "Rejected" ? (reason || null) : null,
      },
      include: { activity: { select: { title: true } } },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("POST /api/social/participation/[id]/review error:", error);
    return NextResponse.json({ error: "Failed to review participation." }, { status: 500 });
  }
}
