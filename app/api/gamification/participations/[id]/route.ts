import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { checkAndAwardBadges } from '@/lib/gamification/badge-engine';
import { notifyBadgeAwards, notifyChallengeDecision } from '@/lib/gamification/notifications';

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await req.json();
    const { status, proofUrl } = body;

    const valid = ['PENDING', 'APPROVED', 'REJECTED'];
    if (status && !valid.includes(status)) {
      return NextResponse.json({ error: `Status must be one of: ${valid.join(', ')}` }, { status: 400 });
    }

    const updated = await prisma.$transaction(async (tx) => {
      const participation = await tx.challengeParticipation.update({
        where: { id },
        data: { status, proofUrl },
        include: { challenge: { select: { xpReward: true, title: true } } },
      });

      if (status === 'APPROVED') {
        const existingXp = await tx.xpLedger.findFirst({
          where: {
            employeeId: participation.employeeId,
            reason: `Challenge: ${participation.challenge.title}`,
          },
        });
        if (!existingXp) {
          await tx.xpLedger.create({
            data: {
              employeeId: participation.employeeId,
              amount: participation.challenge.xpReward,
              reason: `Challenge: ${participation.challenge.title}`,
            },
          });
        }
      }

      return participation;
    });

    // Fire-and-forget: badge check + notification (non-blocking)
    if (status === 'APPROVED' || status === 'REJECTED') {
      const participation = updated;
      notifyChallengeDecision(
        participation.employeeId,
        participation.challenge.title,
        status as 'APPROVED' | 'REJECTED',
        status === 'APPROVED' ? participation.challenge.xpReward : undefined,
      );

      if (status === 'APPROVED') {
        checkAndAwardBadges(participation.employeeId).then((badgeResults) => {
          notifyBadgeAwards(participation.employeeId, badgeResults);
        });
      }
    }

    return NextResponse.json(updated, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to update participation' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    await prisma.challengeParticipation.delete({ where: { id } });
    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to delete participation' }, { status: 500 });
  }
}
