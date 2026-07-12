import { prisma } from '@/lib/db';

interface UnlockRule {
  type: string;
  value?: number;
  challengeType?: string;
}

export interface BadgeAwardResult {
  badgeId: string;
  badgeName: string;
  newlyAwarded: boolean;
}

function safeNum(v: bigint | number | null | undefined): number {
  if (v == null) return 0;
  if (typeof v === 'bigint') return Number(v);
  return v;
}

async function evaluateRule(employeeId: string, rule: UnlockRule): Promise<boolean> {
  switch (rule.type) {
    case 'XP_THRESHOLD': {
      const result = await prisma.xpLedger.aggregate({
        where: { employeeId },
        _sum: { amount: true },
      });
      const totalXp = safeNum(result._sum.amount);
      return totalXp >= (rule.value ?? 0);
    }

    case 'CHALLENGE_COUNT': {
      const where: any = {
        employeeId,
        status: 'APPROVED',
      };
      if (rule.challengeType) {
        // Filter by challenge type/title keyword
        const challenges = await prisma.challenge.findMany({
          where: {
            title: { contains: rule.challengeType, mode: 'insensitive' },
          },
          select: { id: true },
        });
        where.challengeId = { in: challenges.map((c) => c.id) };
      }
      const count = await prisma.challengeParticipation.count({ where });
      return count >= (rule.value ?? 1);
    }

    default:
      return false;
  }
}

export async function checkAndAwardBadges(employeeId: string): Promise<BadgeAwardResult[]> {
  const [allBadges, earnedBadges] = await Promise.all([
    prisma.badge.findMany(),
    prisma.employeeBadge.findMany({
      where: { employeeId },
      select: { badgeId: true },
    }),
  ]);

  const earnedSet = new Set(earnedBadges.map((e) => e.badgeId));
  const results: BadgeAwardResult[] = [];

  for (const badge of allBadges) {
    if (earnedSet.has(badge.id)) {
      results.push({ badgeId: badge.id, badgeName: badge.name, newlyAwarded: false });
      continue;
    }

    const rule = badge.unlockRule as unknown as UnlockRule;
    const satisfied = await evaluateRule(employeeId, rule);

    if (satisfied) {
      await prisma.employeeBadge.create({
        data: { employeeId, badgeId: badge.id },
      });
      results.push({ badgeId: badge.id, badgeName: badge.name, newlyAwarded: true });
    } else {
      results.push({ badgeId: badge.id, badgeName: badge.name, newlyAwarded: false });
    }
  }

  return results;
}
