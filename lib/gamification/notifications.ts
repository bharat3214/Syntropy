import { prisma } from '@/lib/db';

type NotificationType =
  | 'BADGE_UNLOCK'
  | 'CHALLENGE_APPROVAL'
  | 'CHALLENGE_REJECTION'
  | 'XP_EARNED'
  | 'REWARD_REDEEMED';

export async function createNotification(
  employeeId: string,
  type: NotificationType,
  title: string,
  body: string,
  link?: string,
): Promise<void> {
  try {
    await prisma.notification.create({
      data: { employeeId, type, title, body, link },
    });
  } catch (error) {
    console.error(`Failed to create notification for ${employeeId}:`, error);
  }
}

export async function notifyBadgeAwards(
  employeeId: string,
  awards: Array<{ badgeId: string; badgeName: string; newlyAwarded: boolean }>,
): Promise<void> {
  for (const award of awards) {
    if (award.newlyAwarded) {
      await createNotification(
        employeeId,
        'BADGE_UNLOCK',
        `Badge Unlocked: ${award.badgeName}`,
        `Congratulations! You earned the "${award.badgeName}" badge for your sustainability efforts.`,
        '/gamification/badges',
      );
    }
  }
}

export async function notifyChallengeDecision(
  employeeId: string,
  challengeTitle: string,
  status: 'APPROVED' | 'REJECTED',
  xpAwarded?: number,
): Promise<void> {
  if (status === 'APPROVED') {
    await createNotification(
      employeeId,
      'CHALLENGE_APPROVAL',
      'Challenge Approved',
      `Your participation in "${challengeTitle}" has been approved${xpAwarded ? `, earning you ${xpAwarded} XP` : ''}.`,
      '/gamification/challenges',
    );
  } else {
    await createNotification(
      employeeId,
      'CHALLENGE_REJECTION',
      'Challenge Not Approved',
      `Your submission for "${challengeTitle}" was not approved. Please review and resubmit.`,
      '/gamification/challenges',
    );
  }
}

export async function notifyXpEarned(
  employeeId: string,
  amount: number,
  reason: string,
): Promise<void> {
  await createNotification(
    employeeId,
    'XP_EARNED',
    `+${amount} XP Earned`,
    `You earned ${amount} XP: ${reason}`,
    '/gamification',
  );
}

export async function notifyRewardRedeemed(
  employeeId: string,
  rewardName: string,
  pointsSpent: number,
): Promise<void> {
  await createNotification(
    employeeId,
    'REWARD_REDEEMED',
    'Reward Redeemed',
    `You redeemed "${rewardName}" for ${pointsSpent} XP.`,
    '/gamification/rewards',
  );
}
