import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { checkAndAwardBadges } from '@/lib/gamification/badge-engine';
import { notifyBadgeAwards, notifyRewardRedeemed } from '@/lib/gamification/notifications';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { employeeId, rewardId } = body;

    if (!employeeId || !rewardId) {
      return NextResponse.json({ error: 'employeeId and rewardId are required' }, { status: 400 });
    }

    let redeemedRewardName = '';
    let redeemedPoints = 0;

    const result = await prisma.$transaction(async (tx) => {
      const reward = await tx.reward.findUnique({ where: { id: rewardId } });
      if (!reward) throw new Error('REWARD_NOT_FOUND');
      if (reward.stockCount <= 0) throw new Error('OUT_OF_STOCK');

      const xpAgg = await tx.xpLedger.aggregate({
        where: { employeeId },
        _sum: { amount: true },
      });
      const balance = Number(xpAgg._sum.amount ?? 0);
      if (balance < reward.pointCost) throw new Error('INSUFFICIENT_XP');

      redeemedRewardName = reward.itemName;
      redeemedPoints = reward.pointCost;

      const [, , redemption] = await Promise.all([
        tx.xpLedger.create({
          data: {
            employeeId,
            amount: -reward.pointCost,
            reason: `Redeemed: ${reward.itemName}`,
          },
        }),
        tx.reward.update({
          where: { id: rewardId },
          data: { stockCount: { decrement: 1 } },
        }),
        tx.rewardRedemption.create({
          data: { employeeId, rewardId, pointsSpent: reward.pointCost },
        }),
      ]);

      return redemption;
    });

    notifyRewardRedeemed(employeeId, redeemedRewardName, redeemedPoints);

    return NextResponse.json(result, { status: 201 });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Unknown error';
    if (msg === 'REWARD_NOT_FOUND') return NextResponse.json({ error: 'Reward not found' }, { status: 404 });
    if (msg === 'OUT_OF_STOCK') return NextResponse.json({ error: 'Reward is out of stock' }, { status: 409 });
    if (msg === 'INSUFFICIENT_XP') return NextResponse.json({ error: 'Insufficient XP balance' }, { status: 402 });
    console.error(error);
    return NextResponse.json({ error: 'Failed to redeem reward' }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const employeeId = searchParams.get('employeeId');

    const redemptions = await prisma.rewardRedemption.findMany({
      where: employeeId ? { employeeId } : {},
      include: { reward: { select: { itemName: true, pointCost: true } } },
      orderBy: { redeemedAt: 'desc' },
    });

    return NextResponse.json(redemptions, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to fetch redemptions' }, { status: 500 });
  }
}
